import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"

function main() {

    const canvas = document.querySelector('#prova');
    const renderer = new THREE.WebGLRenderer();
    document.getElementById('prova').appendChild(renderer.domElement);
  
    let width = window.innerWidth;
    let height = window.innerHeight;
    const aspect = width / height;  // the canvas default

    renderer.setSize(width, height);

    // console.log(aspect); // OUTPUT
    const fov = 90;
    const near = 2;
    const far = 10;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;
  
    const scene = new THREE.Scene();
  
    { // Light
      const lightColor = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(lightColor, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);
      scene.background = new THREE.Color(0xffffff);
    }
  
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 2;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  
    function makeInstance(geometry, color, x) {
      const material = new THREE.MeshPhongMaterial({color});
  
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
  
      cube.position.x = x;
  
      return cube;
    }




    /******************************/
    
    const planeWidth = 1
    const planeHeight = 1
    const planeDepth = 2
    const planeGeometry = new THREE.BoxGeometry(planeWidth, planeHeight, planeDepth);
    const planeMaterial = new THREE.MeshPhongMaterial({color: 0xffff00, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    scene.add(plane)

    /******************************/
  



    const cubes = [
      makeInstance(geometry, 0x44aa88,  0),
      makeInstance(geometry, 0x8844aa, -2),
      makeInstance(geometry, 0xaa8844,  2),
    ];

    /* Cube rotation animation
    function render(time) {
      time *= 0.001;
  
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
  
      cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
        cube.rotation.z = rot;
      });
  
      renderer.render(scene, camera);
  
      requestAnimationFrame(render);
    }
  
    requestAnimationFrame(render);
    */

   let controls = new OC.OrbitControls( camera, renderer.domElement );
   //controls.addEventListener('change', render);

   window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


   // loop
   function animate() {
 
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

};

animate();

}

  
  main();