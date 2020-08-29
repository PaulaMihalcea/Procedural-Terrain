import * as OC from './assets/three.js/examples/jsm/controls/OrbitControls.js'; // Three.js OrbitControls library
import {Water} from './assets/three.js/examples/jsm/objects/Water.js'; // Three.js water shader
import {diamondSquaredMap} from './assets/diamondSquare.js'; // Diamond-Square algorithm



/************************** PARAMETERS **************************/

// Generic constants & variables
const matrixDimensions = 3; // Number of rows/columns of the terrain square matrix; must be 3 for the current parameters (larger dimensions are very slow and actually unnecessary)
const totalTiles = Math.pow(matrixDimensions, 2); // Total number of tiles
const matrixDist = Math.floor(matrixDimensions / 2); // Distance of the central tile from one side of the matrix (needed for some index calculations)

let width = window.innerWidth // Browser window width
let height = window.innerHeight // Browser windows height

let showMemeFlag = false;


// Camera
let cameraPars = {
    fov: 45, // Field of view
    aspect: width / height, // Aspect ratio
    near: 0.1, // Near plane
    far: 1000, // Far plane

    cameraX: 0, // Camera x position
    cameraY: 5, // Camera y position
    cameraZ: 30 // Camera z position
};


// Orbit camera parameters (to avoid getting too close to the edge)
let orbitCameraPars = {
    panSpeed: 0.1, // Terrain pan movement speed

    maxPanX: 100, // Maximum x axis pan
    maxPanZ: 100 // Maximum z axis pan
};


// Controls parameters
let controlsPars = {
    minDistance: 10, // Minimum zoom distance
    maxDistance: 100, // Maximum zoom distance
    maxPolarAngle: Math.PI / 2.05, // Maximum polar angle (user cannot rotate camera under terrain)

    enableKeys: false, // Default keys are disabled
    enablePan: false // Pan is disabled (W, A, S, D can be used instead)
};


// Stats panel
let statsPars = {
    showPanel: false // Stats panel visibility flag
};


// Scene
let scenePars = {
    timeOfDay: 'foggyDay' // Current scene flag
};


// Movement parameters
let movePars = {
    xDir: 0, // Movement direction along x axis
    zDir: 0, // Movement direction along z axis

    movementSpeed: 0.01, // Terrain movement speed
    
    automove: true, // Automove flag
    movementDirection: 'up', // Automove direction
};


// Update parameters
let updatePars = {
    centralTileI: matrixDist, // Central tile x axis position in the tile matrix (the one that must be checked in order to generate/remove other tiles)
    centralTileJ: matrixDist, // Central tile z axis position in the tile matrix (idem)
};



/************************** TERRAIN & WATER SETTINGS **************************/

// Noise parameters
let noisePars = {
    noiseType: 'perlin', // Current noise type

    seed: Math.floor(Math.random() * 65536) + 1, // Perlin & Simplex noise seed (from 1 to 65536)
    diamondIterations: 6, // Diamond-Square iterations

    noiseTypeNew: 'perlin', // New noise type (selected by user)
    noiseTypeGUI: 'perlin', // Noise type to be shown in the GUI (needed in order to switch correctly from one type to another in the GUI)
    seedNew: 0 // New seed (selected by user)
};


// Terrain parameters
let terrainPars = {
    tileLength: 500, // Current tile length
    tileSegments: 500, // Current tile segments

    maxDistanceFactor: 2, // Distance after which the tile matrix should be updated (must be >=1 in order to avoid errors)

    maxHeight: 5, // Default terrain height

    maxHeightNew: 5, // New terrain height (selected by user)

    smoothnessPS: 7, // Terrain smoothness

    smoothnessPSNew: 7, // New terrain smoothness (selected by user)

    tileTextureFilename: 'img/textures/terrainTexture.jpg',
    tileTextureRepeat: 30, // How many times should the texture repeat

    regenerateTerrain: 
        // Regenerate terrain function (activated from GUI)
        function regenerateTerrain () {

            setTimeout(function() { // Timeout function needed for the loading overlay to work correctly
                
                // Set new parameters
                noisePars.noiseType = noisePars.noiseTypeNew;
                noisePars.seed = noisePars.seedNew;

                terrainPars.maxHeight = terrainPars.maxHeightNew;
                terrainPars.smoothnessPS = terrainPars.smoothnessPSNew;

                // Update GUI
                guiWaterLevel.__min = - terrainPars.maxHeight + terrainPars.maxHeightNew / 2;
                guiWaterLevel.__max = terrainPars.maxHeight - terrainPars.maxHeightNew / 2;
            
                // Generate new terrain
                for (let i = 0; i < matrixDimensions; i++) {
                    for (let j = 0; j < matrixDimensions; j++) {
                        scene.remove(terrain[i][j]);
                    }
                }
            
                init = initTerrain();
                terrain = init[0];
                cell = init[1];

                // Camera & automove reset
                initCamera(orbitCamera);
                movePars.automove = true;

                // Loading overlay removal
                removeLoadingOverlay();
            }, 100);

                // Add loading overlay
                if (showMemeFlag) {
                    showMeme();
                }
                addLoadingOverlay();

                // Stop automove while regenerating terrain
                movePars.automove = false;
        }
};


// Water parameters
let waterPars = {
    color: 0x001e0f, // Water color
    alpha: 1, // Water transparency
    distortionScale: 3.7, // Water distortion scale

    waterTextureFilename: 'img/textures/waternormals.jpg', // Water texture filename
    textureWidth: 512, // Water texture width
    textureHeight: 512, // Water texture height

    showWater: true, // Water visibility flag
    waterY: -1 // Default water level
};



/************************** AMBIENT LIGHTING & EFFECTS PARAMETERS **************************/

// Fog
let fogPars = {
    fogNear: 0.1, // Fog near parameter
    fogFar: 70 // Fog far parameter
};


// Foggy day
let foggyDayPars = {
    ambientLightColor: 0xffffff, // Ambient (diffuse) light color
    ambientLightIntensity: 0.8, // Ambient (diffuse) light intensity

    ambientLightX: 0, // Ambient (diffuse) light x position
    ambientLightY: 6, // Ambient (diffuse) light y position
    ambientLightZ: 20, // Ambient (diffuse) light z position

    sourceLightColor: 0x827268, // Sunlight color
    sourceLightIntensity: 1, // Sunlight intensity

    sourceLightX: 5, // Sunlight x position
    sourceLightY: 3, // Sunlight y position
    sourceLightZ: 0, // Sunlight z position

    sceneColor: 0xffffff // Scene background & fog color
};


// Starry night
let starryNightPars = {
    ambientLightColor: 0x89a7f8, // Ambient (diffuse) light color
    ambientLightIntensity: 0.5, // Ambient (diffuse) light intensity

    ambientLightX: 0, // Ambient (diffuse) light x position
    ambientLightY: 60, // Ambient (diffuse) light y position
    ambientLightZ: 200, // Ambient (diffuse) light z position

    sourceLightColor: 0xca9c76, // Moonlight color
    sourceLightIntensity: 1, // Moonlight intensity

    sourceLightX: 0, // Moonlight x position
    sourceLightY: 10, // Moonlight y position
    sourceLightZ: 5, // Moonlight z position

    sceneColor: 0x090705, // Scene background & fog color
    sceneBackground: loadSkybox('starryNight') // Scene background texture (skybox)
};



/************************** GUI **************************/

let gui = new dat.GUI({width: 450}); // GUI


// Scene
let sceneFolder = gui.addFolder('Scene'); // Scene folder

sceneFolder.add(scenePars, 'timeOfDay', { // Time of day
    'Foggy day': 'foggyDay',
    'Starry night': 'starryNight'
    }).name('Scene (E)').onChange(
        function () {
            setScene(); // Set scene
        }
    ).listen();

sceneFolder.add(statsPars, 'showPanel').name('Show stats panel (Z)').onChange( // Show stats panel
    function() {
        statsPanelToggle(); // Toggle stats panel
    }
).listen();

sceneFolder.open();

// Movement
let moveFolder = gui.addFolder('Movement'); // Movement folder

moveFolder.add(movePars, 'automove').name('Automove (Q)').listen(); // Automove

moveFolder.add(movePars, 'movementDirection', { // Movement direction
    'Up': 'down',
    'Down': 'up',
    'Left': 'right',
    'Right': 'left'
    }).name('Automove direction (ARROWS)').listen();

moveFolder.add(movePars, 'movementSpeed', 0.001, 0.3, 0.001).name('Movement speed'); // Movement speed

moveFolder.open();


// Terrain
let terrainFolder = gui.addFolder('Terrain'); // Terrain folder

terrainFolder.add(noisePars, 'noiseTypeNew', { // Noise type
    'Perlin noise': 'perlin',
    'Simplex noise': 'simplex',
    'Diamond-Square': 'diamondSquare'
    }).name('Noise').onChange(
        function () {
            if (noisePars.noiseTypeNew == 'diamondSquare') {
                // Hide Perlin & Simplex only controls
                guiNoiseSeed.__li.setAttribute('style', 'display: none');
                guiTerrainSmoothness.__li.setAttribute('style', 'display: none');

                // Show Diamond-Square only controls
                guiIterations.__li.setAttribute('style', null);

                // Update terrain height
                terrainPars.maxHeightNew = terrainPars.maxHeight;
            }
            else if ((noisePars.noiseTypeNew == 'perlin' && noisePars.noiseTypeGUI == 'diamondSquare') || (noisePars.noiseTypeNew == 'simplex' && noisePars.noiseTypeGUI == 'diamondSquare')) {
                // Hide Diamond-Square only controls
                guiIterations.__li.setAttribute('style', 'display: none');

                // Show Perlin & Simplex only controls
                guiNoiseSeed.__li.setAttribute('style', null);
                guiTerrainSmoothness.__li.setAttribute('style', null);

                // Update terrain height
                terrainPars.maxHeightNew = terrainPars.maxHeight;
            }

            // Set new noise type when finished
            noisePars.noiseTypeGUI = noisePars.noiseTypeNew;
        }
    ).listen();

let guiNoiseSeed = terrainFolder.add(noisePars, 'seedNew', 1, 65536, 1).name('Noise seed').listen(); // Noise seed (Perlin & Simplex only)
let guiTerrainMaxHeight = terrainFolder.add(terrainPars, 'maxHeightNew', 0, 10, 0.1).name('Terrain height').listen(); // Terrain height
let guiTerrainSmoothness = terrainFolder.add(terrainPars, 'smoothnessPSNew', 1.5, 15, 0.1).name('Terrain smoothness'); // Terrain smoothness (Perlin & Simplex only)
let guiIterations = terrainFolder.add(noisePars, 'diamondIterations', 0, 7, 1).name('Iterations'); // Iterations (Diamond-Square only)
guiIterations.__li.setAttribute('style', 'display: none'); // Hide 'Iterations' menu (default noise type in GUI is Perlin)

terrainFolder.add(terrainPars, 'regenerateTerrain').name('<b>Regenerate terrain (ENTER)</b>'); // Regenerate terrain button

terrainFolder.open();


// Water
let waterFolder = gui.addFolder('Water'); // Water folder

waterFolder.add(waterPars, 'showWater').name('Show water (R)').onChange( // Show water
    function () {
        water.visible = waterPars.showWater; // Toggle water visibility
    }
    ).listen();

let guiWaterLevel = waterFolder.add(waterPars, 'waterY', - terrainPars.maxHeight + terrainPars.maxHeight / 2, terrainPars.maxHeight - terrainPars.maxHeight / 2, 0.01).name('Water level').onChange( // Water level
    function () {
        water.position.y = waterPars.waterY; // Set new water level
    }
);

waterFolder.open();


function showMeme () {
    if (!showMemeFlag) {
        document.getElementById('loadingOverlay').style.display = 'table';
        document.getElementById('loadingOverlayP').style.display = 'none';
        document.getElementById('meme').style.display = 'block';

        showMemeFlag = true;
    }
    else if (showMemeFlag) {
        document.getElementById('loadingOverlay').style.display = 'none';
        document.getElementById('loadingOverlayP').style.display = 'table-cell';
        document.getElementById('meme').style.display = 'none';

        showMemeFlag = false;
    }
}

// Camera
gui.add({WASD: // Use W, A, S, D to pan camera (info)
    function () {
        showMeme();
    }
}, 'WASD').name('<b>Use W, A, S, D to pan camera.</b>');

gui.add({resetCamera: // Reset camera button
    function () {
        initCamera(orbitCamera); // Reset camera to initial parameters
    }
}, 'resetCamera').name('<b>Reset camera (SPACEBAR)</b>').listen();


gui.close();



/************************** INITIALIZATION FUNCTIONS **************************/

// Camera
function initCamera (camera) {
    camera.position.set(cameraPars.cameraX, cameraPars.cameraY, cameraPars.cameraZ); // Set camera position
    camera.lookAt(cameraPars.cameraX, cameraPars.cameraY, cameraPars.cameraZ); // Set camera look at
    camera.updateProjectionMatrix(); // Update camera projection matrix (needed after changing its parameters)
}


// Controls (OrbitControls)
function initControls (controls) {
    controls.minDistance = controlsPars.minDistance; // Minimum zoom-in distance
    controls.maxDistance = controlsPars.maxDistance; // Maximum zoom-out distance
    controls.maxPolarAngle = controlsPars.maxPolarAngle; // Maximum rotation angle (avoids getting the camera under the terrain)
    
    controls.enableKeys = controlsPars.enableKeys; // Disable default keyboard controls (will be overridden)
    controls.enablePan = controlsPars.enablePan; // Disable pan (can be done with keyboard; enable for debug purposes)
}


// Load skybox texture
function loadSkybox (timeOfDay) {
    let skyboxLoader = new THREE.CubeTextureLoader(); // Create texture loader
    let skyboxTexture = 'undefined'; // Create texture

    if (timeOfDay == 'foggyDay') {
        // The 'Foggy Day' scene does not have a skybox, but only uses a plain background color.
    }
    else if (timeOfDay == 'starryNight') {
        skyboxTexture = skyboxLoader.load([
            'img/textures/starryNightTexturePX.png',
            'img/textures/starryNightTextureNX.png',
            'img/textures/starryNightTexturePY.png',
            'img/textures/starryNightTextureNY.png',
            'img/textures/starryNightTexturePZ.png',
            'img/textures/starryNightTextureNZ.png'
        ]);
    }
    
    return skyboxTexture;
}


// Scene setting (switches between times of day)
function setScene () {
    if (scenePars.timeOfDay == 'foggyDay') {
        
        // Ambient light
        ambientLight.color.setHex(foggyDayPars.ambientLightColor); // Set ambient light color
        ambientLight.intensity = foggyDayPars.ambientLightIntensity; // Set ambient light intensity
        ambientLight.position.set(foggyDayPars.ambientLightX, foggyDayPars.ambientLightY, foggyDayPars.ambientLightZ); // Set ambient light position
        ambientLight.castShadow = true; // Ambient light casts shadows
        ambientLight.updateMatrix(); // Update ambient light matrix

        // Sunlight
        sourceLight.color.setHex(foggyDayPars.sourceLightColor); // Set sunlight color
        sourceLight.intensity = foggyDayPars.sourceLightIntensity; // Set sunlight intensity
        sourceLight.position.set(foggyDayPars.sourceLightX, foggyDayPars.sourceLightY, foggyDayPars.sourceLightZ); // Set sunlight position
        sourceLight.castShadow = true; // Sunlight casts shadows
        sourceLight.updateMatrix(); // Update sunlight matrix

        // Scene
        scene.background = new THREE.Color(foggyDayPars.sceneColor); // Set scene background color

        // Fog
        fog.color = new THREE.Color(foggyDayPars.sceneColor); // Set fog color
    }

    else if (scenePars.timeOfDay == 'starryNight') {
        
        // Ambient light
        ambientLight.color.setHex(starryNightPars.ambientLightColor); // Set ambient light color
        ambientLight.intensity = starryNightPars.ambientLightIntensity; // Set ambient light intensity
        ambientLight.position.set(starryNightPars.ambientLightX, starryNightPars.ambientLightY, starryNightPars.ambientLightZ); // Set ambient light position
        ambientLight.castShadow = true; // Ambient light casts shadows
        ambientLight.updateMatrix(); // Update ambient light matrix

        // Moonlight
        sourceLight.color.setHex(starryNightPars.sourceLightColor); // Set moonlight color
        sourceLight.intensity = starryNightPars.sourceLightIntensity; // Set moonlight intensity
        sourceLight.position.set(starryNightPars.sourceLightX, starryNightPars.sourceLightY, starryNightPars.sourceLightZ); // Set moonlight position
        sourceLight.castShadow = true; // Moonlight casts shadows
        sourceLight.updateMatrix(); // Update moonlight matrix

        // Scene
        scene.background = starryNightPars.sceneBackground; // Set scene background to skybox

        // Fog
        fog.color = new THREE.Color(starryNightPars.sceneColor); // Set fog color
    }
}


// Terrain initialization
function initTerrain () {
    let terrain = []; // Terrain matrix
    let cell = []; // Cell number (made of an (i, j) index); needed to create new tiles correctly

    for(let k = 0; k < totalTiles; k++) { // Init terrain and cell arrays as 2D arrays
        terrain[k] = [];
        cell[k] = [];
    }

    for (let i = 0; i < matrixDimensions; i++) {
        for (let j = 0; j < matrixDimensions; j++) {
            terrain[i][j] = addTile(i, j); // Create tile in the specified (i, j) position
            cell[i][j] = [j, i];

            terrain[i][j].material.opacity = 1; // Restore full opacity to the initial terrain matrix

            scene.add(terrain[i][j]); // Add the new tile to the scene
        }
    }

    return [terrain, cell]; // Return the terrain matrix (made of tiles) and each tile's cell number
}


// Water initialization
function initWater () {
    let waterGeometry = new THREE.PlaneBufferGeometry(terrainPars.tileLength * matrixDimensions + 1000, terrainPars.tileLength * matrixDimensions + 1000); // Create water geometry

    let water = new Water(waterGeometry,
        { // Create water texture
            textureWidth: waterPars.textureWidth, // Set water texture width
            textureHeight: waterPars.textureHeight, // Set water texture height
            waterNormals: new THREE.TextureLoader().load(waterPars.waterTextureFilename, function (texture) // Set water texture file
                {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // Set water texture wrapping
                }),
            alpha: waterPars.alpha, // Set water alpha
            waterColor: waterPars.color, // Set water color
            distortionScale: waterPars.distortionScale, // Set water distortion scale
            fog: scene.fog !== undefined // Set water fog
        }
    );

    water.rotation.x = - Math.PI / 2; // Rotate water (for correct viewing)
    water.position.y = waterPars.waterY; // Set water level

    scene.add(water); // Add water to scene

    return water;
}



/************************** MOVEMENT FUNCTIONS **************************/

// Increase tile position (according to movement direction and speed)
function increasePosition (axis, dir){
    if (axis == 'x') {
        for (let i = 0; i < matrixDimensions; i++) {
            for (let j = 0; j < matrixDimensions; j++) {
                terrain[i][j].position.x += movePars.movementSpeed * dir; // Increase tile position on x axis
            }
        }
    }
    else if (axis == 'z') {
        for (let i = 0; i < matrixDimensions; i++) {
            for (let j = 0; j < matrixDimensions; j++) {
                terrain[i][j].position.z += movePars.movementSpeed * dir; // Increase tile position on z axis
            }
        }
    }
}


// Automatic movement
function autoMove (direction){
    switch (direction){
        case 'right':
            movePars.xDir = 1;
            increasePosition('x', movePars.xDir);
            break;
        case 'left':
            movePars.xDir = -1;
            increasePosition('x', movePars.xDir);
            break;
        case 'up':
            movePars.zDir = -1;
            increasePosition('z', movePars.zDir);
            break;
        case 'down':
            movePars.zDir = 1;
            increasePosition('z', movePars.zDir);
            break;
    }
}


// Camera movement (limited W, A, S, D pan)
function moveOrbitCamera (axis, dir) {
    if (axis == 'x') { // x axis
        if ( (orbitCamera.position.x += orbitCameraPars.panSpeed * dir) > -orbitCameraPars.maxPanX && (orbitCamera.position.x += orbitCameraPars.panSpeed * dir) <= orbitCameraPars.maxPanX ) {
            orbitCamera.position.x += orbitCameraPars.panSpeed * dir;
        }
        else {
            orbitCamera.position.x = orbitCameraPars.maxPanX * dir;
        }
    }

    else if (axis == 'z') { // z axis
        if ( (orbitCamera.position.z += orbitCameraPars.panSpeed * dir) > -orbitCameraPars.maxPanZ && (orbitCamera.position.z += orbitCameraPars.panSpeed * dir) <= orbitCameraPars.maxPanZ ) {
            orbitCamera.position.z += orbitCameraPars.panSpeed * dir;
        }
        else {
            orbitCamera.position.z = orbitCameraPars.maxPanZ * dir;
        }
    }
}



/************************** UPDATE FUNCTIONS **************************/

// Add loading overlay
function addLoadingOverlay () {
    document.getElementById('loadingOverlay').style.display = 'table';
}


// Remove loading overlay
function removeLoadingOverlay () {
    document.getElementById('loadingOverlay').style.display = 'none';
}


// Stats panel toggle
function statsPanelToggle () {
    if (statsPars.showPanel) {
        document.body.appendChild(stats.domElement);
    }
    else if (!statsPars.showPanel)  {
        document.body.removeChild(stats.domElement);
    }
}


// Get tile elevation
function getElevation (tileVertices, xPos, zPos) {    
    if (noisePars.noiseType == 'perlin') {
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + xPos) / terrainPars.smoothnessPS,
                                    (tileVertices[k + 1] - zPos) / terrainPars.smoothnessPS)
                                    * terrainPars.maxHeight;
        }
    }
    else if (noisePars.noiseType == 'simplex') {
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Simplex noise)
            tileVertices[k + 2] = noise.simplex2(
                                    (tileVertices[k] + xPos) / terrainPars.smoothnessPS,
                                    (tileVertices[k + 1] - zPos) / terrainPars.smoothnessPS)
                                    * terrainPars.maxHeight;
        }
    }
    else if (noisePars.noiseType == 'diamondSquare') {
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Diamond-Square noise)
            if (!isNaN(tileVertices[k] + xPos) || !isNaN(tileVertices[k + 1] - zPos)){
                tileVertices[k + 2] = diamondSquaredMap(tileVertices[k] + xPos, tileVertices[k + 1] - zPos, 1, 1, noisePars.diamondIterations)[0][0] * terrainPars.maxHeight;
            }
        }        
    }

    return tileVertices;
}


// Add terrain tile
function addTile (i, j) {

    // Texture
    let loader = new THREE.TextureLoader(); // Texture loader
    let tileTexture = loader.load(terrainPars.tileTextureFilename);

    tileTexture.wrapS = THREE.RepeatWrapping;
    tileTexture.wrapT = THREE.RepeatWrapping;
    tileTexture.repeat.set(terrainPars.tileTextureRepeat, terrainPars.tileTextureRepeat);

    let tileMaterial = new THREE.MeshLambertMaterial({map: tileTexture}); // Create textured tile material

    // Geometry
    let tileGeometry = new THREE.PlaneBufferGeometry(terrainPars.tileLength, terrainPars.tileLength, terrainPars.tileSegments, terrainPars.tileSegments); // Create tile geometry

    // Tile creation; position and vertices
    let tile = new THREE.Mesh(tileGeometry, tileMaterial); // Create tile mesh

    let xOffset = terrainPars.tileLength * i; // x axis offset (based on the tile's position in the matrix)
    let zOffset = terrainPars.tileLength * j; // z axis offset (based on the tile's position in the matrix)
    
    tile.position.x += xOffset -= terrainPars.tileLength; // x tile position (based on offset and tile length)
    tile.position.z += zOffset -= terrainPars.tileLength; // z tile position (based on offset and tile length)
    
    tile.rotation.x = - Math.PI / 2; // Tile rotation (for correct viewing)

    tile.geometry.attributes.position.array = getElevation(tile.geometry.attributes.position.array, tile.position.x, tile.position.z)

    tile.receiveShadow = true; // Tiles receive shadows from nearby elevations

    tile.geometry.attributes.position.needsUpdate = true; // Update tile vertices
    tile.geometry.computeVertexNormals(); // Update tile vertex normals

    tile.material.transparent = true;
    tile.material.opacity = 0;

    return tile;
}


// Get new tile vertices
function getTileVertices (i, j, tileVertices) {
    
    let xOffset = terrainPars.tileLength * i; // x axis offset (based on the tile's position in the matrix)
    let zOffset = terrainPars.tileLength * j; // z axis offset (based on the tile's position in the matrix)

    let xPos = xOffset -= terrainPars.tileLength; // x tile position (based on offset and tile length)
    let zPos = zOffset -= terrainPars.tileLength; // z tile position (based on offset and tile length)

    return getElevation(tileVertices, xPos, zPos);
}


// Main update function
function update () {

    // Automove
    if (movePars.automove) {
        autoMove(movePars.movementDirection);
    }

    // Check central tile position and update terrain matrix accordingly (along x axis)
    if ((terrain[updatePars.centralTileI][updatePars.centralTileJ].position.x * terrainPars.maxDistanceFactor > terrainPars.tileLength) || (terrain[updatePars.centralTileI][updatePars.centralTileJ].position.x * terrainPars.maxDistanceFactor < -terrainPars.tileLength)) {

        for (let j = 0; j < matrixDimensions; j++) {
            let i = (updatePars.centralTileI - (2 * movePars.xDir) + matrixDimensions) % matrixDimensions;

            while (terrain[i][j].material.opacity > 0){
                terrain[i][j].material.opacity -= 0.1;
            }

            terrain[i][j].material.opacity = 0; // New tile is transparent in order to allow a fade-in entrance

            scene.remove(terrain[i][j]); // Remove obsolete tile

            // Tile position update
            terrain[i][j].position.x = terrain[i][j].position.x + terrainPars.tileLength * matrixDimensions * -movePars.xDir; // New tile x position
            
            // Tile vertices update
            let tileVertices = terrain[i][j].geometry.attributes.position.array; // Tile vertices array

            cell[i][j][1] = cell[i][j][1] + matrixDimensions * -movePars.xDir;

            tileVertices = getTileVertices(cell[i][j][1], cell[i][j][0], tileVertices);

            terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
            terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

            terrain[i][j].material.opacity = 0; // New tile is transpèarent to allow a fade-in entrance

            scene.add(terrain[i][j]); // Add new tile
        }

        // Update central tile index
        updatePars.centralTileI = (updatePars.centralTileI + (2 * movePars.xDir) + matrixDimensions) % matrixDimensions;
    }

    // Check central tile position and update terrain matrix accordingly (along z axis)
    else if ((terrain[updatePars.centralTileI][updatePars.centralTileJ].position.z * terrainPars.maxDistanceFactor > terrainPars.tileLength) || (terrain[updatePars.centralTileI][updatePars.centralTileJ].position.z * terrainPars.maxDistanceFactor < -terrainPars.tileLength)) {

        for (let i = 0; i < matrixDimensions; i++) {
            let j = (updatePars.centralTileJ - (2 * movePars.zDir) + matrixDimensions) % matrixDimensions;

            while (terrain[i][j].material.opacity > 0){
                terrain[i][j].material.opacity -= 0.1;
            }

            terrain[i][j].material.opacity = 0; // New tile is transparent in order to allow a fade-in entrance

            scene.remove(terrain[i][j]); // Remove obsolete tile

            // Tile position update
            terrain[i][j].position.z = terrain[i][j].position.z + terrainPars.tileLength * matrixDimensions * -movePars.zDir;
            
            // Tile vertices update
            let tileVertices = terrain[i][j].geometry.attributes.position.array; // Tile vertices array

            cell[i][j][0] = cell[i][j][0] + matrixDimensions * -movePars.zDir;

            tileVertices = getTileVertices(cell[i][j][1], cell[i][j][0], tileVertices);

            terrain[i][j].geometry.attributes.position.needsUpdate = true; // Update tile vertices
            terrain[i][j].geometry.computeVertexNormals(); // Update tile vertex normals

            scene.add(terrain[i][j]); // Add new tile
        }

        // Update central tile index
        updatePars.centralTileJ = (updatePars.centralTileJ + (2 * movePars.zDir) + matrixDimensions) % matrixDimensions;
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



/************************** RENDERING FUNCTIONS **************************/

// Rendering
function render () {
    let time = performance.now() * 0.0001;
    water.material.uniforms['time'].value += 0.1 / 60;

    requestAnimationFrame(render);
    renderer.render(scene, orbitCamera);
}


// Animation loop
function loop () {

    stats.begin();
    update();
    stats.end();

    requestAnimationFrame(loop);
}



/************************** MISC FUNCTIONS **************************/

// Random color generator (debug purposes only)
function getRandomColor () {
    let letters = '0123456789abcdef';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// Window resize
function onWindowResize () {
    camera.aspect = window.innerWidth / window.innerHeight; // Camera aspect ratio
    camera.updateProjectionMatrix(); // Camera update
    renderer.setSize(window.innerWidth, window.innerHeight); // Renderer size
}



/************************** CONTROLS **************************/

// Key events
function keyPressed(e){
    switch(e.key){
        case 'Enter':
            terrainPars.regenerateTerrain();
            break;
        case 'z':
            statsPars.showPanel = !statsPars.showPanel;
            statsPanelToggle();
            break;
        case 'r':
            waterPars.showWater = !waterPars.showWater;
            water.visible = waterPars.showWater;
            break;
        case 'q':
            movePars.automove = !movePars.automove;
            break;
        case 'e':
            if (scenePars.timeOfDay == 'starryNight') {
                scenePars.timeOfDay = 'foggyDay';
            }
            else if (scenePars.timeOfDay == 'foggyDay') {
                scenePars.timeOfDay = 'starryNight'
            };
            setScene();
            break;
        case ' ':
            initCamera(orbitCamera);
            controls.update();
            break;
        case 'm':
            showMeme();
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
    else if (!movePars.automove) {
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
                movePars.xDir = -1;
                increasePosition('x', movePars.xDir * movePars.movementSpeed);
                break;
            case 'ArrowRight':
                movePars.xDir = 1;
                increasePosition('x', movePars.xDir * movePars.movementSpeed);
                break;
            case 'ArrowUp':
                movePars.zDir = -1;
                increasePosition('z', movePars.zDir * movePars.movementSpeed);
                break;
            case 'ArrowDown':
                movePars.zDir = 1;
                increasePosition('z', movePars.zDir * movePars.movementSpeed);
                break;
        }
    }
}



/************************** MAIN PROGRAM **************************/

// Event listeners
window.addEventListener('resize', onWindowResize, false); // Window resize listener
document.addEventListener('keydown', keyPressed, false); // Key down listener (for keyboard controls)

// Canvas
let canvas = document.getElementById('canvas'); // HTML canvas element to use


// Renderer
let renderer = new THREE.WebGLRenderer({canvas}); // Renderer object

renderer.setSize(width, height); // Set renderer size to window size
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Shadow antialiasing

document.body.appendChild(renderer.domElement);


// Camera
let camera = new THREE.PerspectiveCamera(cameraPars.fov, cameraPars.aspect, cameraPars.near, cameraPars.far);

initCamera(camera);


// Orbit camera
let orbitCamera = camera.clone();

camera.copy(orbitCamera);


// Controls
let controls = new OC.OrbitControls(orbitCamera, renderer.domElement); // Create OrbitControls object

initControls(controls);


// Stats
let stats = new Stats();


// Scene
let scene = new THREE.Scene();


// Lights
let ambientLight = new THREE.DirectionalLight();
let sourceLight = new THREE.PointLight();
let fog = new THREE.Fog(foggyDayPars.sceneColor, fogPars.fogNear, fogPars.fogFar); // Add fog to the scene

scene.add(ambientLight);
scene.add(sourceLight);
scene.fog = fog;

setScene();


// Noise setting
noisePars.seedNew = noisePars.seed;
noise.seed(noisePars.seed); // Set noise seed


// Terrain creation
let init = initTerrain();
let terrain = init[0];
let cell = init[1];


// Water creation
let water = initWater();

// Remove loading overlay
removeLoadingOverlay();

// Rendering    
loop();
render();