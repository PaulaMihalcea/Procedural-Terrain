import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

    // Constants & variables
    const pi = Math.PI;
    const rotSpeed = 3;

    const matrixDimensions = 3;

    let width = window.innerWidth
    let height = window.innerHeight

    // Canvas
    const canvas = document.querySelector('#canvas');

    // Renderer
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(width, height);

    document.getElementById('canvas').appendChild(renderer.domElement);

    // Stats
    var stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild( stats.dom );

    // Light
    const lightColor = 0xFFFFFF;
    const intensity = 1;

    const light = new THREE.DirectionalLight(lightColor, intensity);

    light.position.set(-1, 2, 4);

    // Scene
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xffffff);
    scene.add(light);

    // Terrain parameters
    noise.seed(6);

    let maxHeight = 0.3; // Maximum terrain height
    let smoothness = 0.3; // Terrain smoothness

    const tileLength = 10;
    const tileSegments = 200;
    let terrainColor = 0x386653; // Terrain base color

    
    // Terrain initialization

    /********************************************************************/ // qui comincia

    function addTile2(x, z){
        let tileGeometry = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments);
        let tileMaterial = new THREE.MeshLambertMaterial({color: getRandomColor()});
        
        //let xOffset = tileLength * i;
        //let zOffset = tileLength * j;

        let tile = new THREE.Mesh(tileGeometry, tileMaterial);
        
        //tile.position.x += xOffset -= tileLength;
        //tile.position.z += zOffset -= tileLength;

        tile.position.x = x;
        tile.position.z = z;
        
        tile.rotation.x = -Math.PI / 2;

        let tileVertices = tile.geometry.attributes.position.array;

        //console.log(tile.position.x / tileSegments);
        
        //console.log(tileVertices[2])

        let ciao = -0.1 //Math.pow(10, 20)

        let prova = noise.perlin2(ciao, ciao) * Math.pow(10, 9)

        console.log(prova);

        /*
        for (let k = 0; k < 5; k++){

            let prova = noise.perlin2(
                tileVertices[k] / tileLength,
                tileVertices[k + 1] / tileLength) * 10

            console.log(prova);
        }

        /* // prova vertici
        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = 3;
        }
        */
        
        //console.log(tileVertices.length, tileVertices.length/3)
        
        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = noise.perlin2(


                                    tileVertices[k] + x,
                                    tileVertices[k + 1] + z)



                                    ;
        }

        /*
        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = noise.perlin2(
                                    tileVertices[k + 1] / tileLength,
                                    tileVertices[k] / tileLength)
                                    * 10;
        }*/

        tile.geometry.attributes.position.needsUpdate = true;
        tile.geometry.computeVertexNormals();

        return tile;
    }

    scene.add(addTile2(0, 0));

    //scene.add(addTile2(tileLength, 0));

    let tileGeometry2 = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments);
    let tileMaterial2 = new THREE.MeshLambertMaterial({color: getRandomColor()});
    
    //let xOffset = tileLength * i;
    //let zOffset = tileLength * j;

    let tile2 = new THREE.Mesh(tileGeometry2, tileMaterial2);
    
    //tile.position.x += xOffset -= tileLength;
    //tile.position.z += zOffset -= tileLength;

    tile2.position.x = 10;
    tile2.position.z = 0;
    
    tile2.rotation.x = -Math.PI / 2;

    let tileVertices2 = tile2.geometry.attributes.position.array;

    //console.log(tileVertices2);

    tileVertices2[2] = 10;


    //console.log(tileVertices2);

    

    scene.add(tile2)

    //console.log(tile.position.x, tile.position.z);


    /********************************************************************/ // qui finisce



































    /*
    var terrain = [];

    for (let k = 0; k < Math.pow(matrixDimensions, 2); k++) {
        let j = Math.floor(k / matrixDimensions);
        let i = k % matrixDimensions;

        terrain[k] = addTile(i, j);
    }

    for (let k = 0; k < Math.pow(matrixDimensions, 2); k++) {
        scene.add(terrain[k]);
    }*/

    // Camera
    const fov = 100;
    const aspect = width / height;
    const near = 0.1;
    const far = 1000;

    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(0, 15, 0); // TODO tileLength * 2.5// 300
    camera.updateProjectionMatrix();

    // Fake camera
    let fakeCamera = camera.clone();
    camera.copy(fakeCamera);

    // Controls
    let controls = new OC.OrbitControls(fakeCamera, renderer.domElement);



    /*
    let prova = noise.perlin2(0.555, 0.556);
    console.log(prova);
    

    /************************** FUNCTIONS **************************/

    // Random color (for debug purposes)
    function getRandomColor() {
        var letters = '0123456789abcdef';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
      }

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);

    // Window resize
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

    };

    // Add tile
    function addTile(i, j) {
        let tileGeometry = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments);
        let tileMaterial = new THREE.MeshLambertMaterial({color: getRandomColor()});
        
        let xOffset = tileLength * i;
        let zOffset = tileLength * j;

        let tile = new THREE.Mesh(tileGeometry, tileMaterial);
        
        tile.position.x += xOffset -= tileLength;
        tile.position.z += zOffset -= tileLength;
        
        tile.rotation.x = -Math.PI / 2;

        let tileVertices = tile.geometry.attributes.position.array;

        /*
        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + tile.position.x) / smoothness,
                                    (tileVertices[k + 1] - tile.position.z) / smoothness,
                                    (tileVertices[k + 2] - tile.position.y) / smoothness)
                                    * maxHeight;
        }
        */
        
        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + tile.position.x) / tileLength * 10,
                                    (tileVertices[k + 1] - tile.position.z) / tileLength * 10)
                                    * maxHeight;
        }

        //console.log(tileVertices[2])

        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k + 1] - tile.position.z) / tileLength * 10,
                                    (tileVertices[k] + tile.position.x) / tileLength * 10)
                                    * maxHeight;
        }

        tile.geometry.attributes.position.needsUpdate = true;
        tile.geometry.computeVertexNormals();

        return tile;
    }

    // Update tile TODO
    function updateTile(x, z) {
        let tileGeometry = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments);
        let tileMaterial = new THREE.MeshLambertMaterial({color: getRandomColor()});
        
        let i = 0;
        let j = -1;

        let xOffset = tileLength * i;
        let zOffset = tileLength * j;

        let tile = new THREE.Mesh(tileGeometry, tileMaterial);
        
        tile.position.x += xOffset -= tileLength;
        tile.position.z += zOffset -= tileLength;
        
        tile.rotation.x = -Math.PI / 2;

        let tileVertices = tile.geometry.attributes.position.array;

        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + tile.position.x) / smoothness,
                                    (tileVertices[k + 1] - (-10)) / smoothness)
                                    * maxHeight;
        }

        tile.geometry.attributes.position.needsUpdate = true;
        tile.geometry.computeVertexNormals();

        tile.position.x = x;
        tile.position.z = z;

        console.log(tile.position.z)

        return tile;
    }

    // Terrain movement
    const movementSpeed = 0.25;
    let currentRow = matrixDimensions
    let index = -1;

    function update() {

        for (let i = 0; i < terrain.length; i++) {
                terrain[i].position.z += movementSpeed;
        }

        //console.log(terrain[currentRow].position.z)

        if ( (terrain[currentRow].position.z % (tileLength*3)) == 0) { // TODO Implementare controllo con una epsilon o in altro modo più furbo

            for (let k = 0; k < matrixDimensions; k++) {
                let h = k + currentRow + matrixDimensions
                let hUp = h - matrixDimensions * (matrixDimensions - 1)
    
                if (h >= Math.pow(matrixDimensions, 2)) {
                    h = k
                }

                if (hUp < 0) {
                    hUp = h + matrixDimensions
                }

                scene.remove(terrain[h]);
                /*
                terrain[h].position.z = terrain[hUp].position.z - tileLength; // ok (no update)
                //terrain[h] = updateTile(terrain[h].position.x, terrain[hUp].position.z - tileLength);
                */

                let newTile = addTile(k, index);
                newTile.position.x = terrain[h].position.x;
                newTile.position.z = terrain[hUp].position.z - tileLength;
                terrain[h] = newTile;
                
                scene.add(terrain[h]);

                console.log(index)
                
            }

            index--;
        
            currentRow = currentRow - matrixDimensions;
                    if (currentRow < 0){
                        currentRow = Math.pow(matrixDimensions, 2) - matrixDimensions;
                    }
    
        }        
    }

    // Rendering
    function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, fakeCamera);
    };

    function loop() {
        
        stats.begin();
        update();
        stats.end();
        requestAnimationFrame(loop);
    }
    

    //loop();

    //scene.add(addTile(0, -1))
    //scene.add(updateTile(terrain[0].position.x, terrain[0].position.z - tileLength));

    render();

}

main();