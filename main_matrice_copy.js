import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

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

    camera.position.set(0, 15, 0); // TODO Set a suitable automatic position
    camera.updateProjectionMatrix();

    // Fake camera
    let fakeCamera = camera.clone();
    camera.copy(fakeCamera);

    // Controls
    let controls = new OC.OrbitControls(fakeCamera, renderer.domElement);
    controls.enableKeys = false; // Disable default keyboard controls (will be later overridden)

    // Event listeners
    window.addEventListener('resize', onWindowResize, false); // Window resize listener
    document.body.addEventListener('keydown', keyPressed, false); // Keyboard listener

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


    /*
    let centralTilep = 12;
    let matrixDimensionsp = 5;

    for(let k=0; k<matrixDimensionsp; k++){
        let pR = centralTilep - matrixDimensionsp*Math.floor(matrixDimensionsp/2) - Math.floor(matrixDimensionsp/2) + k*matrixDimensionsp
        //let pR = p + matrixDimensionsp * (matrixDimensionsp - 1) * -1; // Number of the tile that is going to be removed (needed to get correct position for the new tile)
        

        if (pR < 0){ // Correct tile number if smaller than terrain array minimum index (0)
            pR = Math.pow(matrixDimensionsp, 2) + pR //(matrixDimensionsp-k)
        }

        let p = pR + 

        if (p < 0){
            p = Math.pow(matrixDimensionsp, 2) + p
        }

        console.log(p, pR)

    }
    */

    /*
    let dim = 5;
    let tileC = 11;
    let dist  = Math.floor(dim/2);
    let pow = Math.pow(dim,2);

    for(let k=0; k<dim; k++){
        let p = (tileC - dist * dim+ dist + k*dim) % pow
        console.log(p)
    }


   //console.log('fine',p)


    /************************** SYSTEM FUNCTIONS **************************/

    // Window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight; // Camera aspect ratio
        camera.updateProjectionMatrix(); // Camera update
        renderer.setSize(window.innerWidth, window.innerHeight); // Renderer size
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

    // Automatic movement
    function autoMove(direction){ // TODO Aggiusta direzione
        switch(direction){
            case 'up':
                zDir = -1;
                for (let i = 0; i < matrixDimensions; i++) { // Automatically increase tile position
                    for (let j = 0; j < matrixDimensions; j++) {
                        terrain[i][j].position.z = terrain[i][j].position.z + (movementSpeed * zDir);
                    }
                }
                break;
            case 'down':
                zDir = 1;
                for (let i = 0; i < matrixDimensions; i++) { // Automatically increase tile position
                    for (let j = 0; j < matrixDimensions; j++) {
                        terrain[i][j].position.z = terrain[i][j].position.z + (movementSpeed * zDir);
                    }
                }
                break;
        }
    }
    
    // Key event
    function keyPressed(e){
        switch(e.key){
            case 'ArrowLeft':
                manualMove('x', -1, 0);
                xDir = -1;
                break;
            case 'ArrowRight':
                manualMove('x', 1, 0);
                xDir = 1;
                break;
            case 'ArrowUp':
                manualMove('z', 0, -1);
                zDir = -1;
                break;
            case 'ArrowDown':
                manualMove('z', 0, 1);
                zDir = 1;
                break;
        }
        e.preventDefault();
    }

    // Manual movement
    function manualMove(axis, xDir, zDir){ // TODO Guarda se c'è il verso di eliminare axis
        if (axis == 'x'){
            for (let i = 0; i < matrixDimensions; i++) { // Automatically increase tile position
                for (let j = 0; j < matrixDimensions; j++) {
                    terrain[i][j].position.x = terrain[i][j].position.x + (movementSpeed * zDir);
                }
            }
        }
        else if (axis == 'z'){
            for (let i = 0; i < matrixDimensions; i++) { // Automatically increase tile position
                for (let j = 0; j < matrixDimensions; j++) {
                    terrain[i][j].position.z = terrain[i][j].position.z + (movementSpeed * zDir);
                }
            }
        }
    }

    // Update parameters
    const movementSpeed = 0.5; // Terain movement speed
    const maxDistance = movementSpeed * 3; // Distance after which the tile matrix should be updated

    let centralTileI = dist; // Central tile (the one that must be checked in order to generate/remove other tiles)
    let centralTileJ = dist;
    let upperRow = -1; // Current upper row index, needed for tile generation
    let lowerRow = matrixDimensions; // Current lower row index, needed for tile generation

    // Update function
    function update() { // TODO

        //autoMove('down');

        //console.log('central tile i,j:', centralTileI, centralTileJ, 'central tile z position:', terrain[centralTileI][centralTileJ].position.z)

        // Check central tile position and update terrain matrix accordingly (along z axis)
        if ((terrain[centralTileI][centralTileJ].position.z > tileLength * maxDistance) || (terrain[centralTileI][centralTileJ].position.z < -tileLength * maxDistance)){

            for (let i = 0; i < matrixDimensions; i++) {
                //let j = (matrixDimensions - 1) - ((centralTileJ - dist + matrixDimensions) % matrixDimensions) // TODO manca dipendenza da zDir
                let j = (centralTileJ -2 + matrixDimensions) % matrixDimensions

                //console.log('i, j; i, jR:', i, j, '', i, jR)

                scene.remove(terrain[i][j]); // Remove obsolete tile

                
                console.log('old z:', terrain[i][j].position.z, 'new z:', terrain[i][j].position.z + tileLength * matrixDimensions * -zDir)
                //console.log(h, hR, k)

                let xPos = terrain[i][j].position.x; // New tile x position
                let zPos = terrain[i][j].position.z + tileLength * matrixDimensions * -zDir; // New tile z position

                // Tile update
                let tileVertices = terrain[i][j].geometry.attributes.position.array;

                terrain[i][j].position.x = xPos; // Update tile x position
                terrain[i][j].position.z = zPos; // Update tile z position
                
                if (zDir == 1){
                    tileVertices = getTileVertices(i, upperRow, tileVertices); // Recalculate tile vertices
                }
                else if (zDir == -1){
                    tileVertices = getTileVertices(i, lowerRow, tileVertices); // Recalculate tile vertices
                }

                terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals
                

               //let tileVertices = getTileVertices(i, upperRow, terrain[i][j].geometry.attributes.position.array); // Recalculate tile vertices

                scene.add(terrain[i][j]); // Add new tile
            }
            
            
            // Update row index
            upperRow = upperRow - zDir;
            lowerRow = lowerRow - zDir;

            // Update central tile number
            centralTileJ = (centralTileJ +2 + matrixDimensions) % (matrixDimensions);
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