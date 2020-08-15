import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

    // Constants & variables
    const pi = Math.PI;
    const rotSpeed = 3;

    const matrixDimensions = 3;
    const magnitude = 1;

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

    let maxHeight = 0.02 * magnitude * 10; // Maximum terrain height
    let smoothness = 0.03 * magnitude * 10; // Terrain smoothness

    const tileLength = 10 * magnitude;
    const tileSegments = 500 * magnitude;
    let terrainColor = 0x386653; // Terrain base color

    
    // Terrain initialization
    var terrain = [];

    for (let k = 0; k < Math.pow(matrixDimensions, 2); k++) {
        let i = Math.floor(k / matrixDimensions);
        let j = k % matrixDimensions;

        terrain.push(addTile(i, j));

        scene.add(terrain[k]);
    }

    // Camera
    const fov = 1000 * magnitude / 100;
    const aspect = width / height;
    const near = 0.1;
    const far = 1000 * magnitude;

    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(0, tileLength * 2.5, 0);
    camera.updateProjectionMatrix();

    // Fake camera
    let fakeCamera = camera.clone();
    camera.copy(fakeCamera);

    // Controls
    let controls = new OC.OrbitControls(fakeCamera, renderer.domElement);


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

        for (let k = 0; k <= tileVertices.length; k += 3) {
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + tile.position.x) / smoothness,
                                    (tileVertices[k + 1] - tile.position.z) / smoothness)
                                    * maxHeight;
        }
        tile.geometry.attributes.position.needsUpdate = true;
        tile.geometry.computeVertexNormals();

        return tile;
    }

    // Terrain movement
    const movementSpeed = 0.3;

    function update() {
        for (var i = 0; i < Math.pow(matrixDimensions, 2); i++) {
                terrain[i].position.z += movementSpeed;
                // console.log(terrain[0][0].position.z)
                if (terrain[0][0].position.z >= 0) {
                    scene.remove(terrain[0][2]);
                    scene.remove(terrain[1][2]);
                    scene.remove(terrain[2][2]);
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
    render();

}

main();