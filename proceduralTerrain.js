import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

    /************************** INITIALIZATION **************************/

    let opacity = 0;

    // Generic constants & variables
    const matrixDimensions = 3; // Number of rows/columns of the terrain square matrix; must be 3 for the current parameters (larger dimensions are very slow)
    const totalTiles = Math.pow(matrixDimensions, 2); // Total number of tiles
    const matrixDist = Math.floor(matrixDimensions / 2);

    let width = window.innerWidth // Browser window width
    let height = window.innerHeight // Browser windows height

    // Canvas
    let canvas = document.getElementById('canvas'); // HTML canvas element to use

    // Renderer
    const renderer = new THREE.WebGLRenderer({canvas}); // Renderer object

    renderer.setSize(width, height); // Set renderer size to window size

    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Shadow antialiasing

    document.body.appendChild(renderer.domElement);

    // Stats
    let showPanel = false;

    let stats = new Stats(); // Statistics panel

    if (showPanel == true) {
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
    }
    else {
        stats.showPanel();
    }    

    // Scene
    const scene = new THREE.Scene();
    const sceneColor = 0x06060f; // Background color

    scene.background = new THREE.Color(sceneColor); // Set scene background color

    // Ambient light
    const ambientLightColor = 0x89a7f8; // Ambient light color
    const ambientLightIntensity = 0.3; // Ambient light intensity

    let ambientLight = new THREE.DirectionalLight(ambientLightColor, ambientLightIntensity); // Create ambient light

    let ambientLightX = 0;
    let ambientLightY = 60;
    let ambientLightZ = 200;

    ambientLight.position.set(ambientLightX, ambientLightY, ambientLightZ); // Set ambient light position

    ambientLight.castShadow = true; // Ambient light casts shadows

    scene.add(ambientLight); // Add ambient light to the scene

    // Moonlight
    const moonLightColor = 0x827268; // Moonlight color
    const moonLightIntensity = 1; // Moonlight intensity

    let moonLight = new THREE.PointLight(moonLightColor, moonLightIntensity); // Create moonlight

    let moonLightX = 50;
    let moonLightY = 300;
    let moonLightZ = 50;

    moonLight.position.set(moonLightX, moonLightY, moonLightZ); // Set moonlight position
    
    scene.add(moonLight); // Add moonlight to the scene

    // Fog
    const fogNear = 10; // Fog near parameter
    const fogFar = 5000; // Fog far parameter

    scene.fog = new THREE.Fog(sceneColor, fogNear, fogFar); // Add fog to the scene

    // Noise parameters
    const PerlinSeed = Math.floor(Math.random() * 65536) + 1; // Perlin noise seed (from 1 to 65536)

    noise.seed(PerlinSeed); // Set noise seed

    // Terrain parameters
    let terrainPars = {
        maxHeight: 160, // Maximum terrain height
        smoothness: 250, // Terrain smoothness
        maxHeightOld: 160,
        smoothnessOld: 250
    };

    const tileLength = 3000; // Tile length
    const tileSegments = 1000; // Tile segments

    let movePars = {
        movementSpeed: 1, // Terrain movement speed
        movementSpeedOld: 1, // Previous terrain movement speed
        automove: true,
        movementDirection: 'down'
    };

    let panSpeed = 50; // Terrain pan movement speed
    let maxPanX = 2000;
    let maxPanZ = 2000;

    let maxDistanceFactor = 2; // Distance after which the tile matrix should be updated (must be >=1 in order to avoid errors)

    // Texture parameters
    const terrainColor = 0x211915; // Terrain base color
    const tileTextureFilename = 'tileTexture.jpg'; // Texture filename
    const tileTextureRepeat = 8; // How many times should the texture repeat

    // Camera
    const fov = 45; // Field of view
    const aspect = width / height; // Aspect ratio
    const near = 1; // Near plane
    const far = 10000; // Far plane

    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far); // Create camera

    let cameraX = 0;
    let cameraY = 160;
    let cameraZ = 800;

    camera.position.set(cameraX, cameraY, cameraZ); // Set camera position
    camera.lookAt(cameraX, cameraY, cameraZ); // Set camera lookAt

    camera.updateProjectionMatrix(); // Update camera

    // Orbit camera (needed for OrbitControls)
    let orbitCamera = camera.clone();
    camera.copy(orbitCamera);

    // Controls
    let controls = new OC.OrbitControls(orbitCamera, renderer.domElement); // Create OrbitControls object

    controls.enableKeys = false; // Disable default keyboard controls (will be overridden)
    controls.enablePan = false; // Disable pan (can be done with keyboard)

    controls.maxDistance = 3000; // Maximum zoom-out distance
    controls.maxPolarAngle = Math.PI / 2.3; // Maximum rotation angle (avoids getting the camera under the terrain)

    // GUI
    let gui = new dat.GUI();    

    var autoMoveFolder = gui.addFolder('AutoMove');
    autoMoveFolder.open()

    autoMoveFolder.add(movePars, 'automove').listen();
    autoMoveFolder.add(movePars, 'movementDirection', {'Up': 'down',
                                                       'Down': 'up',
                                                       'Left': 'right',
                                                       'Right': 'left'
                                                      });

    gui.add({resetCamera: function(){controls.reset()}}, 'resetCamera') // Reset camera button

    gui.add(movePars, 'movementSpeed', 1, 100);

    gui.add(terrainPars, 'maxHeight', 0, 500, 1);
    gui.add(terrainPars, 'smoothness', 1, 1500, 1);

    // Event listeners
    window.addEventListener('resize', onWindowResize, false); // Window resize listener

    document.addEventListener('keydown', keyPressed, false); // Key down listener (for keyboard controls)

    // Terrain creation
    let terrain = init();
    let cell = initCell();


    /************************** SYSTEM FUNCTIONS **************************/

    // Window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight; // Camera aspect ratio
        camera.updateProjectionMatrix(); // Camera update
        renderer.setSize(window.innerWidth, window.innerHeight); // Renderer size
    }

    function moveOrbitCamera(axis, dir) {
        if (axis == 'x') {
            if ( (orbitCamera.position.x += panSpeed * dir) > -maxPanX && (orbitCamera.position.x += panSpeed * dir) <= maxPanX ) {
                orbitCamera.position.x += panSpeed * dir;
            }
            else {
                orbitCamera.position.x = maxPanX * dir;
            }
        }
        else if (axis == 'z') {
            if ( (orbitCamera.position.z += panSpeed * dir) > -maxPanZ && (orbitCamera.position.z += panSpeed * dir) <= maxPanZ ) {
                orbitCamera.position.z += panSpeed * dir;
            }
            else {
                orbitCamera.position.z = maxPanZ * dir;
            }
        }
    }

    // Key event
    function keyPressed(e){
        //e.preventDefault();

        switch(e.key){
            case 'q':
                movePars.automove = !movePars.automove;
                break;
            case ' ':
                controls.reset();
                break;
        }

        if (movePars.automove) {
            switch(e.key){
                case 'a':
                    moveOrbitCamera('x', -1);
                    break;
                case 'd':
                    moveOrbitCamera('x', 1);
                    break;
                case 'w':
                    moveOrbitCamera('z', -1);
                    break;
                case 's':
                    moveOrbitCamera('z', 1);
                    break;
                case 'ArrowLeft':
                    movePars.movementDirection = 'right';
                    break;
                case 'ArrowRight':
                    movePars.movementDirection = 'left';
                    break;
                case 'ArrowUp':
                    movePars.movementDirection = 'down';
                    break;
                case 'ArrowDown':
                    movePars.movementDirection = 'up';
                    break;
            }
        }
        else {
            switch(e.key){
                case 'a':
                    moveOrbitCamera('x', -1);
                    break;
                case 'd':
                    moveOrbitCamera('x', 1);
                    break;
                case 'w':
                    moveOrbitCamera('z', -1);
                    break;
                case 's':
                    moveOrbitCamera('z', 1);
                    break;
                case 'ArrowLeft':
                    xDir = -1;
                    increasePosition('x', xDir * movePars.movementSpeed);
                    break;
                case 'ArrowRight':
                    xDir = +1;
                    increasePosition('x', xDir * movePars.movementSpeed);
                    break;
                case 'ArrowUp':
                    zDir = -1;
                    increasePosition('z', zDir * movePars.movementSpeed);
                    break;
                case 'ArrowDown':
                    zDir = 1;
                    increasePosition('z', zDir * movePars.movementSpeed);
                    break;
            }
        }
    }

    // Random color generator (debug purposes only)
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
    function init() {

        let terrain = []; // Terrain matrix

        for(let k = 0; k < totalTiles; k++) {
            terrain[k] = [];
        }

        for (let i = 0; i < matrixDimensions; i++) {
            for (let j = 0; j < matrixDimensions; j++) {
                terrain[i][j] = addTile(i, j); // Create tile in the specified (i, j) position

                terrain[i][j].material.opacity = 1; // Restore full opacity to the initial terrain matrix

                scene.add(terrain[i][j]); // Add the new tile to the scene
            }
        }

        return terrain; // Return the terrain matrix (made of tiles)
    }

    // Init cell // TODO
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

    // Add tile
    function addTile(i, j) {

        // Texture
        let loader = new THREE.TextureLoader(); // Texture loader
        let tileTexture = loader.load(tileTextureFilename);

        tileTexture.wrapS = THREE.RepeatWrapping;
        tileTexture.wrapT = THREE.RepeatWrapping;
        tileTexture.repeat.set(tileTextureRepeat, tileTextureRepeat);

        let tileMaterial = new THREE.MeshLambertMaterial({map: tileTexture}); // Create textured tile material
        //let tileMaterial = new THREE.MeshLambertMaterial({color: terrainColor}); // Create basic colored tile material

        // Geometry
        let tileGeometry = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments); // Create tile geometry

        // Tile creation; position and vertices
        let tile = new THREE.Mesh(tileGeometry, tileMaterial); // Create tile mesh

        let xOffset = tileLength * i; // x axis offset (based on the tile's position in the matrix)
        let zOffset = tileLength * j; // z axis offset (based on the tile's position in the matrix)
        
        tile.position.x += xOffset -= tileLength; // x tile position (based on offset and tile length)
        tile.position.z += zOffset -= tileLength; // z tile position (based on offset and tile length)
        
        tile.rotation.x = -Math.PI / 2; // Tile rotation (for correct viewing)

        let tileVertices = tile.geometry.attributes.position.array; // Tile vertices array
        
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + tile.position.x) / terrainPars.smoothness,
                                    (tileVertices[k + 1] - tile.position.z) / terrainPars.smoothness)
                                    * terrainPars.maxHeight;
        }

        tile.castShadow = true; // Tiles cast shadows
        tile.receiveShadow = true; // Tiles receive shadows from nearby elevations

        tile.geometry.attributes.position.needsUpdate = true; // Update tile vertices
        tile.geometry.computeVertexNormals(); // Update tile vertex normals

        tile.material.transparent = true;
        tile.material.opacity = 0;

        return tile;
    }

    function refreshScene () {
        for (let i = 0; i < matrixDimensions; i++) {
            for (let j = 0; j < matrixDimensions; j++) {
                scene.remove(terrain[i][j]);
            }
        }

        terrain = init();
        terrainPars.maxHeightOld = terrainPars.maxHeight;
        terrainPars.smoothnessOld = terrainPars.smoothness;
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
                                    (tileVertices[k] + xPos) / terrainPars.smoothness,
                                    (tileVertices[k + 1] - zPos) / terrainPars.smoothness)
                                    * terrainPars.maxHeight;
        }

        return tileVertices;
    }

    // Movement direction
    let xDir = 0; // Along x axis
    let zDir = 0; // Along z axis

     // Increase tile position
    function increasePosition (axis, dir){
        if (axis == 'x') {
            for (let i = 0; i < matrixDimensions; i++) {
                for (let j = 0; j < matrixDimensions; j++) {
                    terrain[i][j].position.x += movePars.movementSpeed * dir;
                }
            }
        }
        else if (axis == 'z') {
            for (let i = 0; i < matrixDimensions; i++) {
                for (let j = 0; j < matrixDimensions; j++) {
                    terrain[i][j].position.z += movePars.movementSpeed * dir;
                }
            }
        }
    }

    // Automatic movement
    function autoMove (direction){
        switch (direction){
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
    let centralTileI = matrixDist; // Central tile x axis position in the tile matrix (the one that must be checked in order to generate/remove other tiles)
    let centralTileJ = matrixDist; // Central tile z axis position in the tile matrix

    let loopsCounter = 0; // Counter for waiting a suitable number of updates before actually reinitializing the scene

    // Update function
    function update () {

        // Automove
        if (movePars.automove) {
            autoMove(movePars.movementDirection);
        }

        // Increase counter and refresh parameters (might have changed in the meantime)
        if (loopsCounter != 0) {
            loopsCounter += 1;

            terrainPars.maxHeightOld = terrainPars.maxHeight;
            terrainPars.smoothnessOld = terrainPars.smoothness;
        }

        // Wait x loops before reinitializing scene (otherwise the scene is updated too often and crashes); 200 is a good number
        if (loopsCounter == 200){

            refreshScene(); // Refresh scene if enough loops have passed

            loopsCounter = 0; // Reset counter
        }

        // Check if parameters have been changed (from the GUI)
        if (terrainPars.maxHeightOld != terrainPars.maxHeight || terrainPars.smoothnessOld != terrainPars.smoothness) {
            loopsCounter = 1; // Start increasing loops counter
        }

        console.log(centralTileI, centralTileJ)

        // Check central tile position and update terrain matrix accordingly (along x axis)
        if ((terrain[centralTileI][centralTileJ].position.x * maxDistanceFactor > tileLength) || (terrain[centralTileI][centralTileJ].position.x * maxDistanceFactor < -tileLength)) {

            for (let j = 0; j < matrixDimensions; j++) {
                let i = (centralTileI - (2 * xDir) + matrixDimensions) % matrixDimensions;

                while (terrain[i][j].material.opacity > 0){
                    terrain[i][j].material.opacity -= 0.1;
                }

                terrain[i][j].material.opacity = 0; // New tile is transparent in order to allow a fade-in entrance

                scene.remove(terrain[i][j]); // Remove obsolete tile

                // Tile position update
                terrain[i][j].position.x = terrain[i][j].position.x + tileLength * matrixDimensions * -xDir; // New tile x position
                
                // Tile vertices update
                let tileVertices = terrain[i][j].geometry.attributes.position.array; // Tile vertices array

                cell[i][j][1] = cell[i][j][1] + matrixDimensions * -xDir;

                tileVertices = getTileVertices(cell[i][j][1], cell[i][j][0], tileVertices);

                terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

                terrain[i][j].material.opacity = 0; // New tile is transpèarent to allow a fade-in entrance

                scene.add(terrain[i][j]); // Add new tile
            }

            // Update central tile index
            centralTileI = (centralTileI + (2 * xDir) + matrixDimensions) % matrixDimensions;
        }

        // Check central tile position and update terrain matrix accordingly (along z axis)
        else if ((terrain[centralTileI][centralTileJ].position.z * maxDistanceFactor > tileLength) || (terrain[centralTileI][centralTileJ].position.z * maxDistanceFactor < -tileLength)) {

            for (let i = 0; i < matrixDimensions; i++) {
                let j = (centralTileJ - (2 * zDir) + matrixDimensions) % matrixDimensions;

                while (terrain[i][j].material.opacity > 0){
                    terrain[i][j].material.opacity -= 0.1;
                }

                terrain[i][j].material.opacity = 0; // New tile is transparent in order to allow a fade-in entrance

                scene.remove(terrain[i][j]); // Remove obsolete tile

                // Tile position update
                terrain[i][j].position.z = terrain[i][j].position.z + tileLength * matrixDimensions * -zDir;
                
                // Tile vertices update
                let tileVertices = terrain[i][j].geometry.attributes.position.array; // Tile vertices array

                cell[i][j][0] = cell[i][j][0] + matrixDimensions * -zDir;

                tileVertices = getTileVertices(cell[i][j][1], cell[i][j][0], tileVertices);

                terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
                terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

                scene.add(terrain[i][j]); // Add new tile
            }

            // Update central tile index
            centralTileJ = (centralTileJ + (2 * zDir) + matrixDimensions) % matrixDimensions;
        }

        // Restore tile opacity
        for (let i = 0; i < matrixDimensions; i++) {
            for (let j = 0; j < matrixDimensions; j++) {
                if (terrain[i][j].material.opacity < 1) {
                    terrain[i][j].material.opacity += 0.1;
                }
            }
        }
    }






/* GUI PRESET*/
function getPresetJSON() {
	return {
    "preset": "Default",
    "closed": false,
    "remembered": {
      "Default": {
        "0": {
          "type1_boolean": false,
          "type2_string": "string",
          "type3_number": 0
        },
        "1": {
          "string1": "string1",
          "string2": "string2"
        }
      },
      "Preset1": {
        "0": {
          "type1_boolean": true,
          "type2_string": "string123",
          "type3_number": -2.2938689217758985
        },
        "1": {
          "string1": "string_2",
          "string2": "string_3"
        }
      }
    },
    "folders": {
      "FolderNameA": {
        "preset": "Default",
        "closed": false,
        "folders": {}
      },
      "FolderNameB": {
        "preset": "Default",
        "closed": false,
        "folders": {}
      },
      "FolderNameC": {
        "preset": "Default",
        "closed": false,
        "folders": {}
      }
    }
  };
}




















    /************************** RENDERING FUNCTIONS **************************/

    // Rendering
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, orbitCamera);
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