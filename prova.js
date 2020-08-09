import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

  // Constants
  const pi = Math.PI;
  const rotSpeed = 3;

  // Canvas
  const canvas = document.querySelector('#canvas');

  // Renderer
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById('canvas').appendChild(renderer.domElement);

  // Camera
  const fov = 100;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.z = 5;

  // Fake camera
  let fakeCamera = camera.clone();
  camera.copy(fakeCamera);

  // Light
  const lightColor = 0xFFFFFF;
  const intensity = 1;

  const light = new THREE.DirectionalLight(lightColor, intensity);

  light.position.set(-1, 2, 4);

  // Scene
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0xffffff);
  scene.add(light);
  
  // Cubes
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 2;
  const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(boxGeometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});

    const cube = new THREE.Mesh(boxGeometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(boxGeometry, 0x44aa88, 0),
    makeInstance(boxGeometry, 0x8844aa, -2),
    makeInstance(boxGeometry, 0xaa8844, 2),
  ];

  // Plane
  let makeQuad = function(geometry, position, addFace, verts) {
    geometry.vertices.push(position);
      
    if (addFace) {
      var index1 = geometry.vertices.length - 1;
      var index2 = index1 - 1;
      var index3 = index1 - verts;
      var index4 = index1 - verts - 1;
      
      geometry.faces.push(new THREE.Face3(index2, index3, index1));
      geometry.faces.push(new THREE.Face3(index2, index4, index3));
    }
  };

  let planeSize = 1
  let planeRes = 1
  let geometry = new THREE.Geometry();
  for (var i = 0; i <= planeRes; i++) {
    for (var j = 0; j <= planeRes; j++) {
      var z = j * planeSize;
      var x = i * planeSize;
      var position = new THREE.Vector3(x, 0, z);
      var addFace = (i > 0) && (j > 0);
      makeQuad(geometry, position, addFace, planeRes + 1);
    }
  }
  geometry.computeFaceNormals();
  geometry.normalsNeedUpdate = true;

  scene.add(geometry);

  // Sphere
  let sphereGeometry = new THREE.SphereGeometry(0.8, 128, 128);
  let sphereMaterial = new THREE.MeshNormalMaterial();
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.y += 2
  scene.add(sphere);

  // Generic geometry
  //var texture = new THREE.TextureLoader().load('uv_texture.jpg'); // Texture loading
  let genGeometry = new THREE.Geometry();
  //let genMaterial = new THREE.MeshNormalMaterial({map: texture}); // Textured material
  let genMaterial = new THREE.MeshNormalMaterial();
  let genMesh = new THREE.Mesh(genGeometry, genMaterial);
  genMesh.position.y -= 2.5

  genGeometry.vertices.push(new THREE.Vector3( 1, -1, 0));
  genGeometry.vertices.push(new THREE.Vector3(-1,  1, 0));
  genGeometry.vertices.push(new THREE.Vector3(-1, -1, -1));
  genGeometry.vertices.push(new THREE.Vector3( 1,  1, -1));

  genGeometry.faces.push(new THREE.Face3(0, 1, 2));
  var uvs1 = [new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(0, 0)];
  genGeometry.faceVertexUvs[0].push(uvs1); //remember faceVertexUvs is an array of arrays
  genGeometry.faces.push(new THREE.Face3(0, 3, 1));
  var uvs2 = [new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)];
  genGeometry.faceVertexUvs[0].push(uvs2);

  genGeometry.computeVertexNormals();
  genGeometry.computeFaceNormals(); // Face normals are nice when you make a specific stylistic choice to show off the triangle itself
  genGeometry.normalsNeedUpdate = true;

  scene.add(genMesh);

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

  // Sphere animation
  let updateSphere = function() {
    let x = 1
    let y = 1
    let z = 1

    let k = 3

    let perlin2Value = noise.perlin2(x, y);
    let perlin3Value = noise.perlin3(x, y, z);

    let noiseIntensityOverall = 0.3
    let noiseScale = 1
    let noiseIntensityComponents = 3

    let time = performance.now() * 0.001;

    for (let i = 0; i < sphere.geometry.faces.length; i++) { // Go through vertices/faces here and reposition them

      let uv = sphere.geometry.faceVertexUvs[0][i]; //faceVertexUvs is a huge arrayed stored inside of another array
      let f = sphere.geometry.faces[i];
      let p = sphere.geometry.vertices[f.a];//take the first vertex from each face
      
      //let p = sphere.geometry.vertices[i];

      /*p.normalize().multiplyScalar(noise.perlin3(p.x * noiseIntensityComponents + time,
                                                 p.y * noiseIntensityComponents + time,
                                                 p.z * noiseIntensityComponents + time)
                                                     * noiseIntensityOverall + noiseScale);
      */

     p.normalize().multiplyScalar(noise.perlin3(uv[0].x * noiseIntensityComponents,
                                                uv[0].y * noiseIntensityComponents,
                                                time)   * noiseIntensityOverall + noiseScale);
    }

    sphere.geometry.computeVertexNormals();

    sphere.geometry.verticesNeedUpdate = true; // Must be set or vertices will not update
    sphere.geometry.normalsNeedUpdate = true;
  }

  // Cube animation
  function animateCube(rotSpeed, geometry) {

      rotSpeed = rotSpeed / 180 * pi
    
      if (geometry.rotation.x >= pi * 2) {
        geometry.rotation.x = 0;
        geometry.rotation.y = 0;
        geometry.rotation.z = 0;
      }
      else {
        geometry.rotation.x += rotSpeed;
        geometry.rotation.y += rotSpeed;
        geometry.rotation.z += rotSpeed;
      }

  };

  // Sphere animation
  function animateSphere(rotSpeed, geometry) {

    updateSphere();

  };

  // Rendering
  function render() {

    //animateCube(rotSpeed, cubes[0]);

    animateSphere();
  
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, fakeCamera);
  
  };

  render();

}

main();