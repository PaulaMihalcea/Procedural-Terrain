import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

    // Constants & variables
    const pi = Math.PI;
    const rotSpeed = 3;

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

    let maxHeight = 160; // Maximum terrain height
    let smoothness = 100; // Terrain smoothness

    const tileLength = 1000;
    const tileSegments = 500;
    let terrainColor = 0x386653; // Terrain base color

    
    // Terrain
    const attributes = 3;

    var geometry = []
    var material = [];
    let terrain = [];
    var vertices = [];

    var xOffset;
    var zOffset;

    for(let i=0; i<9; i++) {
        geometry[i] = [];
        material[i] = [];
        terrain[i] = [];
        vertices[i] = [];
    }


    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            geometry[i][j] = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments);
            material[i][j] = new THREE.MeshLambertMaterial({color: getRandomColor()});
            
            xOffset = tileLength * i;
            zOffset = tileLength * j;

            terrain[i][j] = new THREE.Mesh(geometry[i][j], material[i][j]);
            
            terrain[i][j].position.x += xOffset -= tileLength;
            terrain[i][j].position.z += zOffset -= tileLength;

            // console.log(i, j, terrain[i][j].position.x, terrain[i][j].position.z) // TODO
            
            terrain[i][j].rotation.x = -Math.PI / 2;

            scene.add(terrain[i][j]);

            vertices[i][j] = terrain[i][j].geometry.attributes.position.array;

            for (let k = 0; k <= vertices[i][j].length; k += 3) {
                vertices[i][j][k + 2] = noise.perlin2(
                                        (vertices[i][j][k] + terrain[i][j].position.x) / smoothness,
                                        (vertices[i][j][k + 1] - terrain[i][j].position.z) / smoothness)
                                        * maxHeight;
            }
            terrain[i][j].geometry.attributes.position.needsUpdate = true;
            terrain[i][j].geometry.computeVertexNormals();
        }
    }

    // Camera
    const fov = 45;
    const aspect = width / height;
    const near = 0.1;
    const far = 10000;

    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(0, 400, 0);
    //camera.rotation.x = Math.PI; // TODO

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

    // Refresh vertices
    function refreshVertices() {
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                vertices[i][j] = terrain[i][j].geometry.attributes.position.array;
                for (let k = 0; k <= vertices[i][j].length; k += 3) {
                    vertices[i][j][k + 2] = maxHeight * noise.perlin2(
                        (terrain[i][j].position.x + vertices[k])/smoothness, 
                        (terrain[i][j].position.z + vertices[k + 1])/smoothness
                    );
                }
                terrain[i][j].geometry.attributes.position.needsUpdate = true;
                terrain[i][j].geometry.computeVertexNormals();
            }
        }
    }

    // Terrain movement
    var clock = new THREE.Clock();
    var movementSpeed = 1;

    function update() {
        var delta = clock.getDelta();

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                terrain[i][j].position.z += 10;
                //camera.position.z += movementSpeed * delta; // TODO
                //camera.position.set(0, 0, ciao);
                //camera.updateProjectionMatrix(); // TODO
                //refreshVertices();
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
        render();
        stats.end();
        requestAnimationFrame(loop);
    }
    
    loop();
    render();

}

main();