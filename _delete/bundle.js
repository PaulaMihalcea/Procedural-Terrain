(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function main() {

    let mouse3D, isMouseDown = false

    const canvas = document.querySelector('#prova');
    const renderer = new THREE.WebGLRenderer({canvas});
  
    let width = window.innerWidth;
    let height = window.innerHeight;
    const aspect = width / height;  // the canvas default
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
    
    planeWidth = 1
    planeHeight = 1
    planeDepth = 2
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
  
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const pixelRatio = window.devicePixelRatio;
      const width  = canvas.clientWidth  * pixelRatio | 0;
      const height = canvas.clientHeight * pixelRatio | 0;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
  
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

   //controls = new OrbitControls(camera[, domElement])
   controls = new OrbitControls( camera, renderer.domElement );


   renderer.render(scene, camera);





  }
  
  main();
},{}]},{},[1]);
