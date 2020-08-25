import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js";
import {Water} from './three.js/examples/jsm/objects/Water.js';
import {diamondSquaredMap} from './diamondSquare.js';


/************************** PARAMETERS **************************/

// Generic constants & variables
const matrixDimensions = 3; // Number of rows/columns of the terrain square matrix; must be 3 for the current parameters (larger dimensions are very slow)
const totalTiles = Math.pow(matrixDimensions, 2); // Total number of tiles
const matrixDist = Math.floor(matrixDimensions / 2); // Distance of the central tile from a side

let width = window.innerWidth // Browser window width
let height = window.innerHeight // Browser windows height


// Camera
let cameraPars = {
    fov: 45, // Field of view
    aspect: width / height, // Aspect ratio
    near: 1, // Near plane
    far: 10000, // Far plane

    cameraX: 0,
    cameraY: 160,
    cameraZ: 800
};


// Orbit camera parameters (to avoid getting too close to the edge)
let orbitCameraPars = {
    panSpeed: 10, // Terrain pan movement speed
    maxPanX: 1000, // Maximum x axis pan
    maxPanZ: 1000 // Maximum z axis pan
};


// Controls parameters
let controlsPars = {
    minDistance: 100,
    maxDistance: 3000,
    maxPolarAngle: Math.PI / 2.3,

    enableKeys: false,
    enablePan: false
};


// Stats panel
let statsPars = {
    showPanel: false
};


// Scene
let scenePars = {
    timeOfDay: 'starlessNight'
};


// Movement parameters
let movePars = {
    xDir: 0, // Movement direction along x axis
    zDir: 0, // Movement direction along z axis

    movementSpeed: 1, // Terrain movement speed
    
    automove: true,
    movementDirection: 'down', // Automove direction

    movementSpeedOld: 1
};


// Update parameters
let updatePars = {
    centralTileI: matrixDist, // Central tile x axis position in the tile matrix (the one that must be checked in order to generate/remove other tiles)
    centralTileJ: matrixDist, // Central tile z axis position in the tile matrix
};



/************************** TERRAIN & WATER SETTINGS **************************/

// Noise parameters
let noisePars = {
    noiseType: 'perlin',

    seed: Math.floor(Math.random() * 65536) + 1, // Perlin & Simplex noise seed (from 1 to 65536)
    diamondIterations: 6, // Diamond-Square iterations

    noiseTypeNew: 'perlin',
    noiseTypeGUI: 'perlin',
    seedNew: 0
};


// Terrain parameters
let terrainPars = {
    tileLength: 3000, // Current tile length
    tileSegments: 1000, // Current tile segments

    tileLengthPS: 3000, // Default tile length (Perlin & Simplex)
    tileSegmentsPS: 1000, // Default tile segments (Perlin & Simplex)
    tileLengthDiamond: 10, // Default tile length (Diamond-Square)
    tileSegmentsDiamond: 10, // Default tile segments (Diamond-Square)

    tileLengthNew: 10,
    tileSegmentsNew: 10,

    maxDistanceFactor: 2, // Distance after which the tile matrix should be updated (must be >=1 in order to avoid errors)

    maxHeight: 160, // Default maximum terrain height

    maxHeightPS: 160, // Maximum terrain height (Perlin & Simplex)
    maxHeightDiamond: 5, // Maximum terrain height (Diamond-Square)

    smoothness: 250, // Terrain smoothness

    tileTextureFilename: 'textures/tileTexture.jpg',
    tileTextureRepeat: 8, // How many times should the texture repeat

    maxHeightNew: 160,
    smoothnessNew: 250,

    regenerateTerrain: 
        function regenerateTerrain() {
            noisePars.noiseType = noisePars.noiseTypeNew;
            noisePars.seed = noisePars.seedNew;

            terrainPars.tileLength = terrainPars.tileLengthNew;
            terrainPars.tileSegments = terrainPars.tileSegmentsNew;

            terrainPars.maxHeight = terrainPars.maxHeightNew;
            terrainPars.smoothness = terrainPars.smoothnessNew;

            guiWaterLevel.__min = - terrainPars.maxHeight + terrainPars.maxHeight / 2;
            guiWaterLevel.__max = terrainPars.maxHeight - terrainPars.maxHeight / 2;
        
            for (let i = 0; i < matrixDimensions; i++) {
                for (let j = 0; j < matrixDimensions; j++) {
                    scene.remove(terrain[i][j]);
                }
            }
        
            init = initTerrain();
            terrain = init[0];
            cell = init[1];
        }
};


// Water parameters
let waterPars = {
    color: 0x001e0f,
    alpha: 1.0,
    distortionScale: 3.7,

    showWater: true,
    waterY: -50
};



/************************** AMBIENT LIGHTING & EFFECTS PARAMETERS **************************/

// Fog
let fogPars = {
    fogNear: 10, // Fog near parameter
    fogFar: 2000 // Fog far parameter
};


// Foggy day
let foggyDayPars = {
    ambientLightColor: 0xffffff,
    ambientLightIntensity: 1,

    ambientLightX: 0,
    ambientLightY: 60,
    ambientLightZ: 200,

    sourceLightColor: 0x827268,
    sourceLightIntensity: 1,

    sourceLightX: 50,
    sourceLightY: 300,
    sourceLightZ: 50,

    sceneColor: 0xffffff
};


// Starless night
let starlessNightPars = {
    ambientLightColor: 0x89a7f8,
    ambientLightIntensity: 0.3,

    ambientLightX: 0,
    ambientLightY: 60,
    ambientLightZ: 200,

    sourceLightColor: 0x827268,
    sourceLightIntensity: 1,

    sourceLightX: 50,
    sourceLightY: 300,
    sourceLightZ: 50,

    sceneColor: 0x06060f
};



/************************** GUI **************************/

let gui = new dat.GUI({width: 450});


// Scene
let sceneFolder = gui.addFolder('Scene');

sceneFolder.add(scenePars, 'timeOfDay', {'Foggy day': 'foggyDay',
                                'Starless night': 'starlessNight'
                                }).name('Scene (E)').listen();
sceneFolder.add(statsPars, 'showPanel').name('Show stats panel').onChange(
    function() {
        if (statsPars.showPanel) {
            document.body.appendChild(stats.domElement);
        }
        else if (!statsPars.showPanel)  {
            document.body.removeChild(stats.domElement);
        }
    }
);

sceneFolder.open();

// Movement
let moveFolder = gui.addFolder('Movement');

moveFolder.add(movePars, 'automove').name('Automove (Q)').listen();

moveFolder.add(movePars, 'movementDirection', {
    'Up': 'down',
    'Down': 'up',
    'Left': 'right',
    'Right': 'left'
    }).name('Automove direction (ARROWS)').listen();

moveFolder.add(movePars, 'movementSpeed', 1, 100).name('Movement speed');

moveFolder.open();


// Terrain
let terrainFolder = gui.addFolder('Terrain');

terrainFolder.add(noisePars, 'noiseTypeNew', {
    'Perlin noise': 'perlin',
    'Simplex noise': 'simplex',
    'Diamond-square': 'diamondSquare'
    }).name('Noise').onChange(
        function () {
            if (noisePars.noiseTypeNew == 'diamondSquare') {
                guiNoiseSeed.__li.setAttribute('style', 'display: none');
                guiTerrainSmoothness.__li.setAttribute('style', 'display: none');

                guiIterations.__li.setAttribute('style', null);
                guiTerrainMaxHeight.__max = terrainPars.maxHeightDiamond;

                terrainPars.tileLengthNew = terrainPars.tileLengthDiamond;
                terrainPars.tileSegmentsNew = terrainPars.tileSegmentsDiamond;
            }
            else if ((noisePars.noiseTypeNew == 'perlin' && noisePars.noiseTypeGUI == 'diamondSquare') || (noisePars.noiseTypeNew == 'simplex' && noisePars.noiseTypeGUI == 'diamondSquare')) {
                guiIterations.__li.setAttribute('style', 'display: none');

                guiNoiseSeed.__li.setAttribute('style', null);
                guiTerrainSmoothness.__li.setAttribute('style', null);
                guiTerrainMaxHeight.__max = terrainPars.maxHeightPS;

                terrainPars.tileLengthNew = terrainPars.tileLengthPS;
                terrainPars.tileSegmentsNew = terrainPars.tileSegmentsPS;
            }
            noisePars.noiseTypeGUI = noisePars.noiseTypeNew;
        }
    ).listen();

let guiNoiseSeed = terrainFolder.add(noisePars, 'seedNew', 1, 65536, 1).name('Noise seed');
let guiTerrainSmoothness = terrainFolder.add(terrainPars, 'smoothnessNew', 1, 1500, 1).name('Terrain smoothness');
let guiTerrainMaxHeight = terrainFolder.add(terrainPars, 'maxHeightNew', 0, 500, 1).name('Max terrain height');
let guiIterations = terrainFolder.add(noisePars, 'diamondIterations', 0, 7, 1).name('Iterations');
guiIterations.__li.setAttribute('style', 'display: none');

terrainFolder.add(terrainPars, 'regenerateTerrain').name('<b>Regenerate terrain</b>');

terrainFolder.open();


// Water
let waterFolder = gui.addFolder('Water');

waterFolder.add(waterPars, 'showWater').name('Show water (R)').onChange(
    function () {
        water.visible = waterPars.showWater;
    }
    ).listen();

let guiWaterLevel = waterFolder.add(waterPars, 'waterY', - terrainPars.maxHeight + terrainPars.maxHeight / 2, terrainPars.maxHeight - terrainPars.maxHeight / 2).name('Water level').onChange(
    function () {
        water.position.y = waterPars.waterY;
    }
);

waterFolder.open();

gui.add({resetCamera:
    function () {
    controls.reset();
    }
}, 'resetCamera').name('Reset camera (SPACEBAR)').listen();

gui.close();
gui.open() // TODO



/************************** INITIALIZATION FUNCTIONS **************************/

// Camera
function initCamera (camera) {
    camera.position.set(cameraPars.cameraX, cameraPars.cameraY, cameraPars.cameraZ); // Set camera position
    camera.lookAt(cameraPars.cameraX, cameraPars.cameraY, cameraPars.cameraZ); // Set camera look at
    camera.updateProjectionMatrix();
}


// Controls (OrbitControls)
function initControls (controls) {
    controls.minDistance = controlsPars.minDistance;
    controls.maxDistance = controlsPars.maxDistance; // Maximum zoom-out distance
    controls.maxPolarAngle = controlsPars.maxPolarAngle; // Maximum rotation angle (avoids getting the camera under the terrain)
    
    controls.enableKeys = controlsPars.enableKeys; // Disable default keyboard controls (will be overridden)
    //controls.enablePan = controlsPars.enablePan; // Disable pan (can be done with keyboard; enable for debug purposes)
}


// Scene setting (switches between times of day)
function setScene (timeOfDay, ambientLight, sourceLight) {
    if (timeOfDay == 'foggyDay') {
        
        // Ambient light
        ambientLight.color.setHex(foggyDayPars.ambientLightColor);
        ambientLight.intensity = foggyDayPars.ambientLightIntensity;
        ambientLight.position.set(foggyDayPars.ambientLightX, foggyDayPars.ambientLightY, foggyDayPars.ambientLightZ);
        ambientLight.castShadow = true; // Ambient light casts shadows

        // Sunlight
        sourceLight.color.setHex(foggyDayPars.sourceLightColor);
        sourceLight.intensity = foggyDayPars.sourceLightIntensity;
        sourceLight.position.set(foggyDayPars.sourceLightX, foggyDayPars.sourceLightY, foggyDayPars.sourceLightZ);
        sourceLight.castShadow = false;

        // Scene
        scene.background = new THREE.Color(foggyDayPars.sceneColor);

        // Fog
        fog.color = new THREE.Color(foggyDayPars.sceneColor);
    }
    else if (timeOfDay == 'starlessNight') {
        
        // Ambient light
        ambientLight.color.setHex(starlessNightPars.ambientLightColor);
        ambientLight.intensity = starlessNightPars.ambientLightIntensity;
        ambientLight.position.set(starlessNightPars.ambientLightX, starlessNightPars.ambientLightY, starlessNightPars.ambientLightZ);
        ambientLight.castShadow = true; // Ambient light casts shadows
        ambientLight.updateMatrix();

        // Moonlight
        sourceLight.color.setHex(starlessNightPars.sourceLightColor);
        sourceLight.intensity = starlessNightPars.sourceLightIntensity;
        sourceLight.position.set(starlessNightPars.sourceLightX, starlessNightPars.sourceLightY, starlessNightPars.sourceLightZ);
        sourceLight.castShadow = false;
        sourceLight.updateMatrix();

        // Scene
        scene.background = new THREE.Color(starlessNightPars.sceneColor);

        // Fog
        fog.color = new THREE.Color(starlessNightPars.sceneColor);
    }
}


// Terrain initialization
function initTerrain () {

    let terrain = []; // Terrain matrix
    let cell = []; // Cell number (made of an (i, j) index); needed to create new tiles correctly

    for(let k = 0; k < totalTiles; k++) {
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
    let waterGeometry = new THREE.PlaneBufferGeometry(terrainPars.tileLength * matrixDimensions + 1000, terrainPars.tileLength * matrixDimensions + 1000);

    let water = new Water(waterGeometry,
        {
            alpha: waterPars.alpha,
            waterColor: waterPars.color,
            distortionScale: waterPars.distortionScale,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;
    water.position.y = waterPars.waterY;

    scene.add(water);

    return water;
}



/************************** MOVEMENT FUNCTIONS **************************/

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


// Camera movement
function moveOrbitCamera (axis, dir) {
    if (axis == 'x') {
        if ( (orbitCamera.position.x += orbitCameraPars.panSpeed * dir) > -orbitCameraPars.maxPanX && (orbitCamera.position.x += orbitCameraPars.panSpeed * dir) <= orbitCameraPars.maxPanX ) {
            orbitCamera.position.x += orbitCameraPars.panSpeed * dir;
        }
        else {
            orbitCamera.position.x = orbitCameraPars.maxPanX * dir;
        }
    }
    else if (axis == 'z') {
        if ( (orbitCamera.position.z += orbitCameraPars.panSpeed * dir) > -orbitCameraPars.maxPanZ && (orbitCamera.position.z += orbitCameraPars.panSpeed * dir) <= orbitCameraPars.maxPanZ ) {
            orbitCamera.position.z += orbitCameraPars.panSpeed * dir;
        }
        else {
            orbitCamera.position.z = orbitCameraPars.maxPanZ * dir;
        }
    }
}



/************************** UPDATE FUNCTIONS **************************/

// Get tile elevation
function getElevation (tileVertices, xPos, zPos) {
    if (noisePars.noiseType == 'perlin') {
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + xPos) / terrainPars.smoothness,
                                    (tileVertices[k + 1] - zPos) / terrainPars.smoothness)
                                    * terrainPars.maxHeight;
        }
    }
    else if (noisePars.noiseType == 'simplex') {
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Simplex noise)
            tileVertices[k + 2] = noise.simplex2(
                                    (tileVertices[k] + xPos) / terrainPars.smoothness,
                                    (tileVertices[k + 1] - zPos) / terrainPars.smoothness)
                                    * terrainPars.maxHeight;
        }
    }
    else if (noisePars.noiseType == 'diamondSquare') { // TODO troppo piccolo, va scalato O cambiata la camera e la nebbia (probabilmente meglio scalare)
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Diamond-Square noise)
            if (!isNaN(tileVertices[k] + xPos) || !isNaN(tileVertices[k + 1] - zPos)){
                tileVertices[k + 2] = diamondSquaredMap(tileVertices[k] + xPos, tileVertices[k + 1] - zPos, 1, 1, noisePars.diamondIterations)[0][0] * terrainPars.maxHeightDiamond;
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

    if (noisePars.noiseType != 'diamondSquare') {
        tileTexture.wrapS = THREE.RepeatWrapping;
        tileTexture.wrapT = THREE.RepeatWrapping;
        tileTexture.repeat.set(terrainPars.tileTextureRepeat, terrainPars.tileTextureRepeat);
    }

    let tileMaterial = new THREE.MeshLambertMaterial({map: tileTexture}); // Create textured tile material

    // Geometry
    let tileGeometry = new THREE.PlaneBufferGeometry(terrainPars.tileLength, terrainPars.tileLength, terrainPars.tileSegments, terrainPars.tileSegments); // Create tile geometry

    // Tile creation; position and vertices
    let tile = new THREE.Mesh(tileGeometry, tileMaterial); // Create tile mesh

    let xOffset = terrainPars.tileLength * i; // x axis offset (based on the tile's position in the matrix)
    let zOffset = terrainPars.tileLength * j; // z axis offset (based on the tile's position in the matrix)
    
    tile.position.x += xOffset -= terrainPars.tileLength; // x tile position (based on offset and tile length)
    tile.position.z += zOffset -= terrainPars.tileLength; // z tile position (based on offset and tile length)
    
    tile.rotation.x = -Math.PI / 2; // Tile rotation (for correct viewing)

    tile.geometry.attributes.position.array = getElevation(tile.geometry.attributes.position.array, tile.position.x, tile.position.z)

    tile.castShadow = true; // Tiles cast shadows
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


// GUI preset // TODO
function getGUIPreset () {
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



/************************** CONTROLS **************************/

// Key events
function keyPressed(e){
    switch(e.key){
        case 'r':
            waterPars.showWater = !waterPars.showWater;
            water.visible = waterPars.showWater;
            break;
        case 'q':
            movePars.automove = !movePars.automove;
            break;
        case 'e':
            if (scenePars.timeOfDay == 'starlessNight') scenePars.timeOfDay = 'foggyDay'
            else if (scenePars.timeOfDay == 'foggyDay') scenePars.timeOfDay = 'starlessNight';
            setScene();
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

setScene(scenePars.timeOfDay, ambientLight, sourceLight);


// Noise setting
noisePars.seedNew = noisePars.seed;
noise.seed(noisePars.seed); // Set noise seed


// Terrain creation
let init = initTerrain();
let terrain = init[0];
let cell = init[1];


// Water creation
let water = initWater();


// Rendering    
loop();
render();