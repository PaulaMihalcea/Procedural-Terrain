import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

    /************************** INITIALIZATION **************************/

    // Generic constants & variables
    let matrixDimensions = 3; // Number of rows/columns of the terrain square matrix

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

         /* Tiles are numbered (in a 3x3 matrix):

         *  0 1 2   // First row
         *  3 4 5   // Second row
         *  6 7 8   // Third row
         * 
         *  The same order is followed for smaller/larger matrices.
         *  Additionally, the same cells have the following (i, j) coordinates:
         * 
         *  00 01 02
         *  10 11 12
         *  20 21 22
         * 
         *  Tiles will be created in the following order: 00 10 20 - 01 11 21 - 02 12 22 (or 0 3 6 - 1 4 7 - 2 5 8).
        */

        for (let k = 0; k < Math.pow(matrixDimensions, 2); k++) {
            let i = k % matrixDimensions; // Get row number
            let j = Math.floor(k / matrixDimensions); // Get column number

            terrain[k] = addTile(i, j); // Create tile in the specified (i, j) position

            scene.add(terrain[k]); // Add the new tile to the scene
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
    let zDir = 0; // Along z axis

    // Automatic movement
    function autoMove(direction){ // TODO Aggiusta direzione
        switch(direction){
            case 'up':
                zDir = -1;
                for (let k = 0; k < terrain.length; k++) { // Automatically increase tile position
                    terrain[k].position.z = terrain[k].position.z + (movementSpeed * zDir);
                }
                break;
            case 'down':
                zDir = 1;
                for (let k = 0; k < terrain.length; k++) { // Automatically increase tile position
                    terrain[k].position.z = terrain[k].position.z + (movementSpeed * zDir);
                }
                break;
        }
    }
    
    // Key event
    function keyPressed(e){
        switch(e.key){
            case 'ArrowLeft':
                manualMove('x', -1);
                break;
            case 'ArrowRight':
                manualMove('x', 1);
                break;
            case 'ArrowUp':
                manualMove('z', -1);
                zDir = -1;
                break;
            case 'ArrowDown':
                manualMove('z', 1);
                zDir = 1;
                break;
        }
        e.preventDefault();
    }

    // Manual movement
    function manualMove(axis, zDir){
        if (axis == 'x'){
            for (let k = 0; k < terrain.length; k++) { // Automatically increase tile position
                terrain[k].position.x = terrain[k].position.x + (movementSpeed * zDir);
            }
        }
        else if (axis == 'z'){
            for (let k = 0; k < terrain.length; k++) { // Automatically increase tile position
                terrain[k].position.z = terrain[k].position.z + (movementSpeed * zDir);
            }
        }
    }

    // Update parameters
    const movementSpeed = 0.5; // Terain movement speed
    const maxDistance = movementSpeed * 3; // Distance after which the tile matrix should be updated

    let centralTile = matrixDimensions * Math.floor(matrixDimensions / 2) + Math.floor(matrixDimensions / 2); // Central tile (the one that must be checked in order to generate/remove other tiles)
    let upperRow = -1; // Current upper row index, needed for tile generation
    let lowerRow = matrixDimensions; // Current lower row index, needed for tile generation

    function checkCentralTile(){
        if (centralTile < 0) {
            centralTile = Math.pow(matrixDimensions, 2) - matrixDimensions + Math.floor(matrixDimensions / 2);
        }
        else if (centralTile >= Math.pow(matrixDimensions, 2)) {
            centralTile = Math.floor(matrixDimensions / 2);
        }
    }

    // Update function
    function update() { // TODO

        //autoMove('down');

        // Check central tile position and update terrain matrix accordingly (along z axis)
        if ((terrain[centralTile].position.z > tileLength * maxDistance) || (terrain[centralTile].position.z < -tileLength * maxDistance)){

            for (let k = 0; k < matrixDimensions; k++) {
                let h = k + centralTile - Math.floor(matrixDimensions / 2) + matrixDimensions * zDir; // Number of the tile that is going to be updated
                let hR = h + matrixDimensions * (matrixDimensions - 1) * -zDir; // Number of the tile that is going to be removed (needed to get correct position for the new tile)

                if (h < 0){ // Correct tile number if smaller than terrain array minimum index (0)
                    h = k + Math.pow(matrixDimensions, 2) - matrixDimensions;
                }
                else if (h >= Math.pow(matrixDimensions, 2)) { // Correct tile number if larger than terrain array length
                    h = k;
                }

                if (hR < 0) { // Correct tile number if smaller than terrain array minimum index (0)
                    hR = h + matrixDimensions;
                }
                else if (hR >= Math.pow(matrixDimensions, 2)) { // Correct tile number if larger than terrain array length
                    hR = k;
                }

                scene.remove(terrain[h]); // Remove obsolete tile

                let xPos = terrain[h].position.x; // New tile x position
                let zPos = terrain[hR].position.z + tileLength * -zDir;

                // Tile update
                let tileVertices = terrain[h].geometry.attributes.position.array;

                terrain[h].position.x = xPos; // Update tile x position
                terrain[h].position.z = zPos; // Update tile z position
                
                if (zDir == 1){
                    tileVertices = getTileVertices(k, upperRow, tileVertices); // Recalculate tile vertices
                }
                else if (zDir == -1){
                    tileVertices = getTileVertices(k, lowerRow, tileVertices); // Recalculate tile vertices
                }

                terrain[h].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[h].geometry.computeVertexNormals(); // Update tile vertex normals

                scene.add(terrain[h]); // Add new tile
            }

            // Update row index
            upperRow = upperRow - zDir;
            lowerRow = lowerRow - zDir;

            // Update central tile number
            centralTile = centralTile + matrixDimensions * -zDir;
            checkCentralTile();
        }
    }


   // TODO /************************** MULTITHREADED UPDATE FUNCTION (POSSIBLY OBSOLETE) **************************/
   /*
   let ciao = new Array();
    function update_mt() {

        

         // Automatically increase tile position
        for (let k = 0; k < terrain.length; k++) {
                terrain[k].position.z += movementSpeed;
        }

        // Check central tile position and update terrain matrix accordingly
        if ( (terrain[centralTile].position.z % (tileLength*2)) == 0) {

            let tileWorkers = [];

            for (let k = 0; k < matrixDimensions; k++) {
                tileWorkers[k] = new Worker('tileWorker.js');

                tileWorkers[k].postMessage([PerlinSeed, maxHeight, smoothness, tileLength, tileSegments, terrainColor, k, upperRow]);

                tileWorkers[k].addEventListener('message', function(e) {
                    tileWorkersResults[k] = e.data[0];

                    ciao[k] = e.data[0];


                })
            }


            for (let k = 0; k < matrixDimensions; k++) {
                let u = k + centralTile + matrixDimensions; // Number of the tile that is going to be updated
                let uR = u - matrixDimensions * (matrixDimensions - 1); // Number of the tile that is going to be removed (needed to get correct position for the new tile)
    
                if (u >= Math.pow(matrixDimensions, 2)) { // Correct tile number if larger than terrain array length
                    u = k;
                }

                if (uR < 0) { // Correct tile number if smaller than terrain array minimum index (0)
                    uR = u + matrixDimensions;
                }

                scene.remove(terrain[u]); // Remove obsolete tile

                let xPos = terrain[u].position.x; // New tile x position
                let zPos = terrain[uR].position.z - tileLength; // New tile z position

                terrain[u].position.x = xPos;
                terrain[u].position.z = zPos;


                console.log(k, ciao[k])

                if (typeof tileWorkersResults[k] != 'undefined'){
                    terrain[u].geometry.attributes.position.array = tileWorkersResults[k];
                }

                terrain[u].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[u].geometry.computeVertexNormals(); // Update tile vertex normals

                scene.add(terrain[u]);
            }

             // Update i index
            upperRow--;
        
             // Update central tile number
            centralTile = centralTile - matrixDimensions;
                if (centralTile < 0){
                    centralTile = Math.pow(matrixDimensions, 2) - matrixDimensions;
                }
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