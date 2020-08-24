import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

    let intersect = [];

    /************************** INITIALIZATION **************************/

    // Generic constants & variables
    let matrixDimensions = 3; // Number of rows/columns of the terrain square matrix
    let totalTiles = Math.pow(matrixDimensions, 2); // Total number of tiles
    let dist = Math.floor(matrixDimensions / 2);

    let width = window.innerWidth // Browser window width
    let height = window.innerHeight // Browser windows height

    // Canvas
    const canvas = document.querySelector('#canvas'); // HTML canvas element to use

    // Renderer
    const renderer = new THREE.WebGLRenderer(); // Renderer object
    renderer.setSize(width, height); // Set renderer size to window size
    document.getElementById('canvas').appendChild(renderer.domElement);

    // Stats
    let stats = new Stats(); // Statistics panel
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // Light
    const lightColor = 0xffffff; // Light color
    const intensity = 1; // Light color opacity

    const light = new THREE.DirectionalLight(lightColor, intensity);

    //light.position.set(-1, 2, 4); // TODO

    // Scene
    const scene = new THREE.Scene();
    const sceneColor = 0x000000; // Background color

    scene.background = new THREE.Color(sceneColor); // Set scene background color
    scene.add(light); // Add light to the scene

    // Terrain parameters
    const PerlinSeed = 6 // TODO Math.floor(Math.random() * 65536) + 1; // Perlin noise seed (from 1 to 65536)

    noise.seed(PerlinSeed);

    let maxHeight = 0.5; // Maximum terrain height
    let smoothness = 1; // Terrain smoothness

    const tileLength = 10; // Tile length
    const tileSegments = 500; // Tile segments
    let terrainColor = 0x386653; // Terrain base color

    // Camera
    const fov = 100; // Field of view
    const aspect = width / height; // Aspect ratio
    const near = 0.1; // Near plane
    const far = 1000; // Far plane

    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(10, 5, 10); // TODO Set a suitable automatic position
    camera.updateProjectionMatrix();

    // Fake camera
    let fakeCamera = camera.clone();
    camera.copy(fakeCamera);

    // Controls
    let controls = new OC.OrbitControls(fakeCamera, renderer.domElement);
    controls.enableKeys = false; // Disable default keyboard controls (will be later overridden)
    controls.enablePan = false;


    controls.enableRotation = false;
    
    //console.log(controls.enableRotation, controls.enablePan)

    // Event listeners
    window.addEventListener('resize', onWindowResize, false); // Window resize listener

    //document.addEventListener('mousedown', mouseDown); // Mouse down listener
    //document.addEventListener('onclick', onClickciao); // Mouse click listener
    //document.addEventListener('mouseenter', mouseEnter); // Mouse enter listener

    document.addEventListener('keydown', keyPressed, false); // Keyboard down listener

    // Terrain creation
    let terrain = init();
    let tileWorkersResults = [];


    /************************** PROVA WORKER **************************/
    /*
    let worker = new Worker('tileWorker.js');
            
    worker.addEventListener('message', function(e) {

        let tile2 = addTile(0, -1)

        tile2.position.x = e.data[0];
        tile2.position.z = e.data[1];
        tile2.geometry.attributes.position.array = e.data[2];

        scene.add(tile2);
    })

    worker.postMessage([PerlinSeed, maxHeight, smoothness, tileLength, tileSegments, terrainColor, -1, 0]);
    */


    /************************** SYSTEM FUNCTIONS **************************/

    // Window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight; // Camera aspect ratio
        camera.updateProjectionMatrix(); // Camera update
        renderer.setSize(window.innerWidth, window.innerHeight); // Renderer size
    }

    function mouseDown(e){
        if (controls.enableRotate == false) {
            controls.enableRotate = true;
        }
        else if (controls.enableRotate == true) {
            controls.enableRotate = false;
            e.preventDefault();
        }
    }

    // Key event
    function keyPressed(e){
        switch(e.key){
            case 'ArrowLeft':
                xDir = -1;
                increasePosition('x', xDir);
                break;
            case 'ArrowRight':
                xDir = 1;
                increasePosition('x', xDir);
                break;
            case 'ArrowUp':
                zDir = -1;
                increasePosition('z', zDir);
                break;
            case 'ArrowDown':
                zDir = 1;
                increasePosition('z', zDir);
                break;
        }
        e.preventDefault();
    }

    // Random color generator (for debug purposes)
    function getRandomColor() {
        let letters = '0123456789abcdef';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /************************** INITIALIZATION  FUNCTIONS **************************/

    // Terrain initialization
    function init(){
        let terrain = []; // Tile array (has dimensions matrixDimensions x matrixDimensions)

        for(let k = 0; k < totalTiles; k++) {
            terrain[k] = [];
        }

        for (let i = 0; i < matrixDimensions; i++) {
            for (let j = 0; j < matrixDimensions; j++) {
                terrain[i][j] = addTile(i, j); // Create tile in the specified (i, j) position

                scene.add(terrain[i][j]); // Add the new tile to the scene
            }
        }

        return terrain; // Return the tile array
    }

    // Add tile
    function addTile(i, j) {
        let tileGeometry = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments); // Create tile geometry
        let tileMaterial = new THREE.MeshLambertMaterial({color: getRandomColor()}); // Create tile material
        
        let xOffset = tileLength * i; // x axis offset (based on the tile's position in the matrix)
        let zOffset = tileLength * j; // z axis offset (based on the tile's position in the matrix)

        let tile = new THREE.Mesh(tileGeometry, tileMaterial); // Create tile mesh
        
        tile.position.x += xOffset -= tileLength; // x tile position (based on offset and tile length)
        tile.position.z += zOffset -= tileLength; // z tile position (based on offset and tile length)
        
        tile.rotation.x = -Math.PI / 2; // Tile rotation (for correct viewing)

        let tileVertices = tile.geometry.attributes.position.array; // Tile vertices array
        
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + tile.position.x) / smoothness,
                                    (tileVertices[k + 1] - tile.position.z) / smoothness)
                                    * maxHeight;
        }

        tile.geometry.attributes.position.needsUpdate = true; // Update tile vertices
        tile.geometry.computeVertexNormals(); // Update tile vertex normals

        return tile;
    }








    /* ALBERI */ 


    /* alberi procedurali

    // Helper function to transform the vertices and faces
    function newTreeGeometry(tree, isTwigs) {
        var output = new THREE.Geometry();
    
        tree[ isTwigs ? 'vertsTwig' : 'verts'].forEach(function(v) {
        output.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
        });
    
        var uv = isTwigs ? tree.uvsTwig : tree.UV;
        tree[ isTwigs ? 'facesTwig' : 'faces'].forEach(function(f) {
        output.faces.push(new THREE.Face3(f[0], f[1], f[2]));
        output.faceVertexUvs[0].push(f.map(function(v) {
            return new THREE.Vector2(uv[v][0], uv[v][1]);
        }));
        });
    
        output.computeFaceNormals();
        output.computeVertexNormals(true);
    
        return output;
    }
    
    var tree = new Tree({
		"seed": 262,
		"segments": 6,
		"levels": 5,
		"vMultiplier": 2.36,
		"twigScale": 0.39,
		"initalBranchLength": 0.49,
		"lengthFalloffFactor": 0.85,
		"lengthFalloffPower": 0.99,
		"clumpMax": 0.454,
		"clumpMin": 0.1,
		"branchFactor": 2.45,
		"dropAmount": -0.1,
		"growAmount": 0.235,
		"sweepAmount": 0.01,
		"maxRadius": 0.139,
		"climbRate": 0.371,
		"trunkKink": 0.093,
		"treeSteps": 5,
		"taperRate": 0.947,
		"radiusFalloffRate": 0.73,
		"twistRate": 3.02,
		"trunkLength": 2.4
	});
    
    var trunkGeo = newTreeGeometry(tree);
    var trunkMaterial = new THREE.MeshLambertMaterial( { color: 0xdddddd, wireframe: false } );
    var trunkMesh = new THREE.Mesh(trunkGeo, trunkMaterial);
    scene.add(trunkMesh); // Use your own scene
    
    var twigsGeo = newTreeGeometry(tree, true);
    var twigsMaterial = new THREE.MeshLambertMaterial( { color: 0x005000, wireframe: false } );
    var twigsMesh = new THREE.Mesh(twigsGeo, twigsMaterial);
    scene.add(twigsMesh); // Use your own scene

    */



/*
   function ellipsoid () {
    var latitudeBands=30,longitudeBands=20,a=6,b=7,c=20,size=5;
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++)
        {
            var theta = (latNumber *      Math.PI *2/ latitudeBands);
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
           
             for (var longNumber=0; longNumber <= longitudeBands; longNumber++)
             {
                var phi = (longNumber  *2* Math.PI / longitudeBands);
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);
               

                var x = a*cosPhi * cosTheta ;
                var y = b*cosTheta*sinPhi;
                var z = c*sinTheta;
                ellipsoidgeometry.vertices.push(new THREE.Vector3( x*size,y*size,z*size));
               
            }
       
   
    }

    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
    var first = (latNumber * (longitudeBands + 1)) + longNumber;
    var second = first + longitudeBands + 1;
    ellipsoidgeometry.faces.push(new THREE.Face3(first,second,first+1));
   

    ellipsoidgeometry.faces.push(new THREE.Face3(second,second+1,first+1));
   
      }
    }
}

let ellipsoidgeometry =new THREE.Geometry();
ellipsoid();
var redmaterial =  new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
let ellipsoidmesh = new THREE.Mesh(ellipsoidgeometry,redmaterial);
scene.add(ellipsoidmesh);
*/

function getRandomNumberBetween (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function generateTrees(numberOfTrees) { // NOTE: All current parameters have been specifically set for the use of this function in this particular terrain script
    // Tree geometry
    let treeRadius = 1;
    let treeWidthSegments = 30;
    let treeHeightSegments = 30;

    let treeGeometry = new THREE.SphereBufferGeometry(treeRadius, treeWidthSegments, treeHeightSegments);

    // Tree shape deformation
    let treeScaleX = 1;
    let treeScaleY = 4.5;
    let treeScaleZ = 1;

    treeGeometry.applyMatrix4(new THREE.Matrix4().makeScale(treeScaleX, treeScaleY, treeScaleZ));

    // Tree material
    let treeColor = 0x00ff00;
    let treeMaterial = new THREE.MeshLambertMaterial({color: treeColor});

    let tree = new THREE.Mesh(treeGeometry, treeMaterial);

    // Tree noise (more deformation)
    let maxTreeDef = 0.4;
    let treeVertices = tree.geometry.attributes.position.array;
            
    for (let k = 0; k < treeVertices.length; k++) {
        treeVertices[k] = treeVertices[k] + noise.perlin3(treeVertices[k], treeVertices[k], treeVertices[k]) * maxTreeDef;
    }

    tree.geometry.attributes.position.needsUpdate = true;
    tree.geometry.computeVertexNormals();

    // Tree position
    let treeX = getRandomNumberBetween(-tileLength*matrixDimensions/2, tileLength*matrixDimensions/2);
    let treeZ = getRandomNumberBetween(-tileLength*matrixDimensions/2, tileLength*matrixDimensions/2);

    // Raycasting
    for (let i = 0; i < matrixDimensions; i++) {
        for (let j = 0; j < matrixDimensions; j++) {

            let rayCaster = new THREE.Raycaster();
            let rayFrom = new THREE.Vector3();

            let rayFromX = treeX;
            let rayFromY = 5; // use a high enough number to ensure ray starts above terrain
            let rayFromZ = treeZ;

            rayFrom.set(rayFromX, rayFromY, rayFromZ);

            let rayDir = new THREE.Vector3(0, -1, 0); // Ray points down

            terrain[i][j].updateMatrixWorld();
            
            rayCaster.set(rayFrom, rayDir);

            let intersectResult = rayCaster.intersectObject(terrain[i][j], true); // Check where the tree intersects the terrain mesh

            if (intersectResult.length > 0) {
                intersect = intersectResult;
            }            
        }
    }

    let treeY = intersect[0].point.y + treeRadius * treeScaleY;

    tree.position.set(treeX, treeY, treeZ)

    scene.add( tree );

    

}


let numberOfTrees = 1;

for (let i=0; i<numberOfTrees;i++){
    generateTree();
}











/*

THREE.EllipsoidGeometry = function ( width, height, depth, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

    THREE.SphereGeometry.call( this, width * 0.5, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );

    this.applyMatrix( new THREE.Matrix4().makeScale( 1.0, height/width, depth/width ) );

};

THREE.EllipsoidGeometry.prototype = Object.create( THREE.Geometry.prototype );
*/










































    /************************** MOVEMENT FUNCTIONS **************************/

    // Get new tile vertices
    function getTileVertices(i, j, tileVertices) {
        
        let xOffset = tileLength * i; // x axis offset (based on the tile's position in the matrix)
        let zOffset = tileLength * j; // z axis offset (based on the tile's position in the matrix)

        let xPos = xOffset -= tileLength; // x tile position (based on offset and tile length)
        let zPos = zOffset -= tileLength; // z tile position (based on offset and tile length)
        
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + xPos) / smoothness,
                                    (tileVertices[k + 1] - zPos) / smoothness)
                                    * maxHeight;
        }

        return tileVertices;
    }

    // Movement direction
    let xDir = 0; // Along x axis
    let zDir = 0; // Along z axis

     // Increase tile position
    function increasePosition(axis, dir){
        if (axis == 'x') {
            for (let i = 0; i < matrixDimensions; i++) {
                for (let j = 0; j < matrixDimensions; j++) {
                    terrain[i][j].position.x += + (movementSpeed * dir);
                }
            }
        }
        else if (axis == 'z') {
            for (let i = 0; i < matrixDimensions; i++) {
                for (let j = 0; j < matrixDimensions; j++) {
                    terrain[i][j].position.z += (movementSpeed * dir);
                }
            }
        }
    }

    // Automatic movement
    function autoMove(direction){ // TODO Aggiusta direzione
        switch(direction){
            case 'right':
                xDir = 1;
                increasePosition('x', xDir);
                break;
            case 'left':
                xDir = -1;
                increasePosition('x', xDir);
                break;
            case 'up':
                zDir = -1;
                increasePosition('z', zDir);
                break;
            case 'down':
                zDir = 1;
                increasePosition('z', zDir);
                break;
        }
    }

    // Update parameters
    const movementSpeed = 0.5; // Terain movement speed
    const maxDistance = movementSpeed * 3; // Distance after which the tile matrix should be updated

    let centralTileI = dist; // Central tile x axis position in the tile matrix (the one that must be checked in order to generate/remove other tiles)
    let centralTileJ = dist; // Central tile z axis position in the tile matrix
    let topRow = -1; // Current topmost row index, needed for tile generation
    let leftColumn = -1; // Current leftmost row index, needed for tile generation

    // Update function
    function update() { // TODO

        //autoMove('right');

        // Check central tile position and update terrain matrix accordingly (along x axis)
        if ((terrain[centralTileI][centralTileJ].position.x > tileLength * maxDistance) || (terrain[centralTileI][centralTileJ].position.x < -tileLength * maxDistance)){

            for (let j = 0; j < matrixDimensions; j++) {
                let i = (centralTileI - (2 * xDir) + matrixDimensions) % matrixDimensions;

                scene.remove(terrain[i][j]); // Remove obsolete tile

                // Tile update
                let tileVertices = terrain[i][j].geometry.attributes.position.array;

                terrain[i][j].position.x = terrain[i][j].position.x + tileLength * matrixDimensions * -xDir; // New tile x position
                
                if (xDir == 1){
                    tileVertices = getTileVertices(leftColumn, j, tileVertices); // Recalculate tile vertices
                }
                else if (xDir == -1){
                    tileVertices = getTileVertices(leftColumn + matrixDimensions + 1, j, tileVertices); // Recalculate tile vertices
                }

                terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

                scene.add(terrain[i][j]); // Add new tile
            }
            
            // Update row index
            leftColumn = leftColumn - xDir;

            // Update central tile number
            centralTileI = (centralTileI + (2 * xDir) + matrixDimensions) % matrixDimensions;
        }

        // Check central tile position and update terrain matrix accordingly (along z axis)
        else if ((terrain[centralTileI][centralTileJ].position.z > tileLength * maxDistance) || (terrain[centralTileI][centralTileJ].position.z < -tileLength * maxDistance)){

            for (let i = 0; i < matrixDimensions; i++) {
                let j = (centralTileJ - (2 * zDir) + matrixDimensions) % matrixDimensions;

                scene.remove(terrain[i][j]); // Remove obsolete tile

                // Tile position update
                terrain[i][j].position.z = terrain[i][j].position.z + tileLength * matrixDimensions * -zDir;
                
                // Tile vertices update
                let tileVertices = terrain[i][j].geometry.attributes.position.array;

                if (zDir == 1){
                    tileVertices = getTileVertices(i, topRow, tileVertices);
                }
                else if (zDir == -1){
                    tileVertices = getTileVertices(i, topRow + matrixDimensions + 1, tileVertices);
                }

                terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

                scene.add(terrain[i][j]); // Add new tile
            }
            
            // Update row index
            topRow = topRow - zDir;

            // Update central tile number
            centralTileJ = (centralTileJ + (2 * zDir) + matrixDimensions) % matrixDimensions;
        }
    }

    /************************** RENDERING FUNCTIONS **************************/

    // Rendering
    function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, fakeCamera);
    }

    // Animation loop
    function loop() {
        stats.begin();
        update();
        stats.end();
        requestAnimationFrame(loop);
    }


    /************************** RENDERING **************************/
    
    loop();
    render();
}

main();