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

    // Camera
    const fov = 100; // TODO 45
    const aspect = width / height;
    const near = 0.1; // TODO 1
    const far = 3000;
    var cameraTarget = {x:0, y:0, z:0};

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.x = 0.5;
    camera.position.y = 0.8;
    camera.position.z = 2; // TODO 1
    //camera.rotation.x = -1 * Math.PI / 180; // TODO

    // Fake camera
    let fakeCamera = camera.clone();
    camera.copy(fakeCamera);

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

    let maxHeight = 0.2; // Maximum terrain height
    let smoothness = 0.3; // Terrain smoothness

    const tileOffset = 2;
    let tileSize = 256;
    let terrainColor = 0x386653; // Terrain base color

    
    // Plane matrix
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
            geometry[i][j] = new THREE.PlaneBufferGeometry(tileOffset, tileOffset, tileSize, tileSize);
            material[i][j] = new THREE.MeshLambertMaterial({color: terrainColor});
            
            xOffset = tileOffset * i;
            zOffset = tileOffset * j;

            terrain[i][j] = new THREE.Mesh(geometry[i][j], material[i][j]);
            
            terrain[i][j].position.x += xOffset;
            terrain[i][j].position.z += zOffset;
            
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








    /*
    // Plane 1
    let geometry1 = new THREE.PlaneBufferGeometry(tileOffset, tileOffset, 256, 256);
    let material1 = new THREE.MeshLambertMaterial({color: terrainColor});
    let terrain1 = new THREE.Mesh(geometry1, material1);

    terrain1.rotation.x = -Math.PI / 2;
    terrain1.position.x = 10;

    console.log(terrain1.position.x)
    
    scene.add(terrain1);

    let vertices1 = terrain1.geometry.attributes.position.array;

    //console.log(vertices)

    for (let i = 0; i <= vertices1.length; i += 3) {
        //console.log(vertices[i])
        vertices1[i + 2] = noise.perlin2(vertices1[i]/smoothness, vertices1[i + 1]/smoothness) * maxHeight;
    }

    terrain1.geometry.attributes.position.needsUpdate = true;
    terrain1.geometry.computeVertexNormals();
    /*

    // Plane 2
    let geometry2 = new THREE.PlaneBufferGeometry(tileLength, tileLength, 256, 256);
    let material2 = new THREE.MeshLambertMaterial({color: 0xfffff});
    var terrain2 = new THREE.Mesh(geometry2, material2);
    terrain2.rotation.x = -Math.PI / 2;

    
    terrain2.position.x += tileLength;
    //terrain2.position.y += 0.5; // TODO
    
    var vertices2 = terrain2.geometry.attributes.position.array;

    for (var i = 0; i <= vertices2.length; i += 3) {
        vertices2[i + 2] = maxHeight * noise.perlin2(
            (vertices2[i] + terrain2.position.x) /smoothness, 
            (vertices2[i+1] + terrain2.position.y) /smoothness
        );
    }

    terrain2.geometry.attributes.position.needsUpdate = true;
    terrain2.geometry.computeVertexNormals();


    scene.add(terrain2);
    console.log(terrain2.position.x)
    */













    // Controls
    let controls = new OC.OrbitControls(fakeCamera, renderer.domElement);


    /************************** FUNCTIONS **************************/

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
        var vertices = terrain.geometry.attributes.position.array;
        for (var i = 0; i <= vertices.length; i += 3) {
            vertices[i+2] = maxHeight * noise.perlin2(
                (terrain.position.x + vertices[i])/smoothness, 
                (terrain.position.z + vertices[i+1])/smoothness
            );
        }
        terrain.geometry.attributes.position.needsUpdate = true;
        terrain.geometry.computeVertexNormals();
    }

    // Terrain movement
    var clock = new THREE.Clock();
    var movementSpeed = 1;
    function update() {
        var delta = clock.getDelta();
        terrain.position.z += movementSpeed * delta;
        camera.position.z += movementSpeed * delta;
        refreshVertices();
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
    
    //loop();
    render();

}

main();