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

    camera.position.y = 0.8;
    camera.position.z = 1;
    //camera.rotation.x = 1 * Math.PI / 180; // TODO

    // Fake camera
    let fakeCamera = camera.clone();
    camera.copy(fakeCamera);

    // Stats
    var stats = new Stats();
    stats.showPanel( 0 );
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

    // Plane
    var geometry = new THREE.PlaneBufferGeometry(2, 2, 256, 256);
    var material = new THREE.MeshLambertMaterial({ color: 0x3c3951 });
    var terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    var peak = 0.1;
    var smoothing = 0.3;
    var vertices = terrain.geometry.attributes.position.array;

    for (var i = 0; i <= vertices.length; i += 3) {
        vertices[i + 2] = peak * noise.perlin2(
        vertices[i]/smoothing, 
        vertices[i+1]/smoothing
    );
    }
    terrain.geometry.attributes.position.needsUpdate = true;
    terrain.geometry.computeVertexNormals();


















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
            vertices[i+2] = peak * noise.perlin2(
                (terrain.position.x + vertices[i])/smoothing, 
                (terrain.position.z + vertices[i+1])/smoothing
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
    
    loop();
    // render();

}

main();