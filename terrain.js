function main() {

  var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0,
  };

  width = window.innerWidth;
  height = window.innerHeight;

  const canvas = document.querySelector('#t');
  var renderer = new THREE.WebGLRenderer({canvas});

  // Camera
  const fov = 75;
  var aspect_ratio = width / height;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect_ratio, near, far);
  var vFOV = camera.fov * (Math.PI / 180); //
  camera.position.z = height / (2 * Math.tan(vFOV / 2) ); //
  //camera.position.z = 0.2;

    // Scene
  var scene = new THREE.Scene();

  /*// Lighting
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }
  */

  // Terrain definition
  /*
  var plane_width = 2000
  var plane_height = 2000
  var geometry = new THREE.PlaneGeometry(plane_width, plane_height, 2, 2); // Geometry

  var material_properties = {color: 0x3c3951,
                             //opacity: 0.50,
                             side: THREE.DoubleSide}

  var material = new THREE.MeshPhongMaterial(material_properties); // Material

  var mesh = new THREE.Mesh(geometry, material); // Mesh
  */

 var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
 var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
 var mesh = new THREE.Mesh( geometry, material );
  
  // Mesh rotation
  //mesh.rotation.x = -Math.PI / 2;

  scene.add(mesh);

  function render() {
    requestAnimationFrame( render );
    mesh.rotation.y += 0.1;
      renderer.render( scene, camera );
   }

   render();


  //renderer.render(scene, camera);
}

main();
