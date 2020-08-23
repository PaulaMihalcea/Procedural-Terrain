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

    // Camera initial position
    let xCamPos = 0;
    let yCamPos = tileLength;
    let zCamPos = tileLength * 2.5;

    camera.position.set(xCamPos, yCamPos, zCamPos); // TODO Set a suitable automatic position

    // Camera initial rotation
    let xCamRot = 0;
    let yCamRot = 0;
    let zCamRot = 0;

    camera.rotation.set(xCamRot, yCamRot, zCamRot);

    camera.updateProjectionMatrix();

    // Event listeners
    window.addEventListener('resize', onWindowResize, false); // Window resize
    document.addEventListener('mousedown', mouseDown, false); // Mouse down
    document.addEventListener('mousemove', mouseMove, false); // Mouse move
    document.addEventListener('keydown', keyPressed, false); // Keyboard down listener

    // Terrain creation
    let terrain = init();
    let tileWorkersResults = [];


    /************************** SYSTEM FUNCTIONS **************************/

    // Window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight; // Camera aspect ratio
        camera.updateProjectionMatrix(); // Camera update
        renderer.setSize(window.innerWidth, window.innerHeight); // Renderer size
    }



    
    let scale = 0.000001;

    let xDelta = 0;
    let yDelta = 0;
    let prevX = 0;
    let prevY = 0;

    let moveFlag = false;

    function mouseDown(e){
        xDelta = e.clientX;
        yDelta = e.ClientY;

        prevX = e.clientX;
        prevY = e.clientY;

        if (moveFlag == false){
            moveFlag = true;
        }
        else if (moveFlag == true){
            moveFlag = false;
        }
    }
    
    
    function mouseMove(e) {
        e.preventDefault();

        if(moveFlag){

            if (e.clientX < prevX) {
                xDelta += -e.clientX / canvas.offsetHeight;
            }
            else {
                xDelta += e.clientX / canvas.offsetHeight;
            }

            if (e.clientY < prevY) {
                yDelta += -e.clientY / canvas.offsetHeight;
            }
            else {
                yDelta += e.clientY / canvas.offsetHeight;
            }

            prevX = e.clientX;
            prevY = e.clientY;

            console.log(xDelta)

            camera.rotation.set(0, xDelta, 0);

            camera.updateProjectionMatrix();
            
            /*
            if ( isMouseDown ) {
        
                theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 )
                        + onMouseDownTheta;
                phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 )
                    + onMouseDownPhi;
        
                phi = Math.min( 180, Math.max( 0, phi ) );
        
                camera.position.x = radious * Math.sin( theta * Math.PI / 360 )
                                    * Math.cos( phi * Math.PI / 360 );
                camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
                camera.position.z = radious * Math.cos( theta * Math.PI / 360 )
                                    * Math.cos( phi * Math.PI / 360 );
                camera.updateMatrix();
        
            }*/
        }
    }

    // Key event
    function keyPressed(e){
        e.preventDefault();
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

        //controls.enableRotate = enableControlsRotate;

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
        renderer.render(scene, camera);
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