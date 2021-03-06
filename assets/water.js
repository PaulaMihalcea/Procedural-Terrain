import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"
import { Water } from './three.js/examples/jsm/objects/Water.js';

function main() {

    /************************** INITIALIZATION **************************/

    // Generic constants & variables
    let matrixDimensions = 3; // Number of rows/columns of the terrain square matrix
    let totalTiles = Math.pow(matrixDimensions, 2); // Total number of tiles
    let dist = Math.floor(matrixDimensions / 2);

    let width = window.innerWidth // Browser window width
    let height = window.innerHeight // Browser windows height

    // Canvas
    let canvas = document.getElementById('canvas'); // HTML canvas element to use

    // Renderer
    const renderer = new THREE.WebGLRenderer({canvas}); // Renderer object
    renderer.setSize(width, height); // Set renderer size to window size
    document.body.appendChild(renderer.domElement);

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
    const sceneColor = 0xffffff; // Background color

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

    camera.position.set(0, 15, 0); // TODO Set a suitable automatic position
    camera.updateProjectionMatrix();

    // Fake camera
    let fakeCamera = camera.clone();
    camera.copy(fakeCamera);

    // Controls
    let controls = new OC.OrbitControls(fakeCamera, renderer.domElement);
    controls.enableKeys = false; // Disable default keyboard controls (will be later overridden)
    //controls.enablePan = false;
    //controls.enableRotation = false;
    
    //console.log(controls.enableRotation, controls.enablePan)

    // Event listeners
    window.addEventListener('resize', onWindowResize, false); // Window resize listener

    //document.addEventListener('mousedown', mouseDown); // Mouse down listener
    //document.addEventListener('onclick', onClickciao); // Mouse click listener
    //document.addEventListener('mouseenter', mouseEnter); // Mouse enter listener

    document.addEventListener('keydown', keyPressed, false); // Keyboard down listener

    // Terrain creation
    let terrain = init();
    let cell = initCell();
    






    // WATER

    var waterGeometry = new THREE.PlaneBufferGeometry(tileLength, tileLength);

    let water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            alpha: 1.0,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.position.set(0, 5,0)

    water.rotation.x = - Math.PI / 2;

    let waterVertices = water.geometry.attributes.position.array;
        
    for (let k = 0; k <= waterVertices.length; k += 3) { // Elevation (Perlin noise)
        waterVertices[k + 2] = noise.perlin2(
                                (waterVertices[k] + water.position.x) / smoothness,
                                (waterVertices[k + 1] - water.position.z) / smoothness)
                                * maxHeight;
    }

    water.geometry.attributes.position.needsUpdate = true; // Update tile vertices
    water.geometry.computeVertexNormals(); // Update tile vertex normals


    var heartShape = new THREE.Shape();

    heartShape.moveTo( 25, 25 );
    heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
    heartShape.bezierCurveTo( 30, 0, 30, 35,30,35 );
    heartShape.bezierCurveTo( 30, 55, 10, 77, 25, 95 );
    heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
    heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
    heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );
    
    //var extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    
    var geometry = new THREE.ShapeGeometry( heartShape );
    
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );

    scene.add(mesh)









    scene.add( water );










































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

    function initCell() {
        let cell = [];

        for(let k = 0; k < totalTiles; k++) {
            cell[k] = [];
        }

        for (let i = 0; i < matrixDimensions; i++) {
            for (let j = 0; j < matrixDimensions; j++) {
                cell[i][j] = [j, i]
            }
        }

        return cell;
    }

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


    /************************** MOVEMENT FUNCTIONS **************************/

    // Get new tile vertices
    function getTileVertices(i, j, tileVertices) {

        console.log(i, j)
        
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
    let col = -1;
    let row = -1;

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
                
                
                cell[i][j][1] = cell[i][j][1] + matrixDimensions * -xDir;
                console.log(cell[i][j][1], cell[i][j][0], 'cell x')

                tileVertices = getTileVertices(cell[i][j][1], cell[i][j][0], tileVertices); // Recalculate tile vertices

                terrain[i][j].geometry.attributes.position.array = tileVertices;

                terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

                scene.add(terrain[i][j]); // Add new tile
            }
            
            // Update row index
            row = row - xDir;

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

                cell[i][j][0] = cell[i][j][0] + matrixDimensions * -zDir;
                console.log(cell[i][j][1], cell[i][j][0], 'cell z')

                tileVertices = getTileVertices(cell[i][j][1], cell[i][j][0], tileVertices);

                terrain[i][j].geometry.attributes.position.array = tileVertices;

                terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

                scene.add(terrain[i][j]); // Add new tile
            }
            
            // Update row index
            col = col - zDir;

            // Update central tile number
            centralTileJ = (centralTileJ + (2 * zDir) + matrixDimensions) % matrixDimensions;
        }
    }

    /************************** RENDERING FUNCTIONS **************************/

    // Rendering
    function render() {
        var time = performance.now() * 0.01;
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
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