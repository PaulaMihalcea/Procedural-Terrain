importScripts("./three.js/build/three.min.js");
importScripts("./perlin.js");

  self.addEventListener('message', function(e) {

    /* WORKER ATTRIBUTES
    *
    * 0 : PerlinSeed
    * 1 : maxHeight
    * 2 : smoothness
    * 3 : tileLength
    * 4 : tileSegments
    * 5 : terrainColor
    * 6 : i
    * 7 : j
    */

    noise.seed(e.data[0]);

    let tile = addTile(e.data[6], e.data[7]);

    self.postMessage([tile.position.x, tile.position.z, tile.geometry.attributes.position.array]);
    self.close();


    /************************** FUNCTIONS **************************/

    // Add tile
    function addTile(i, j) {
        let tileGeometry = new THREE.PlaneBufferGeometry(e.data[3], e.data[3], e.data[4], e.data[4]); // Create tile geometry
        let tileMaterial = new THREE.MeshLambertMaterial(); // Create tile material
        
        let xOffset = e.data[3] * e.data[6]; // x axis offset (based on the tile's position in the matrix)
        let zOffset = e.data[3] * e.data[7]; // z axis offset (based on the tile's position in the matrix)

        let tile = new THREE.Mesh(tileGeometry, tileMaterial); // Create tile mesh
        
        tile.position.x += xOffset -= e.data[3]; // x tile position (based on offset and tile length)
        tile.position.z += zOffset -= e.data[3]; // z tile position (based on offset and tile length)
        
        tile.rotation.x = -Math.PI / 2; // Tile rotation (for correct viewing)

        let tileVertices = tile.geometry.attributes.position.array; // Tile vertices array
        
        for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)
            tileVertices[k + 2] = noise.perlin2(
                                    (tileVertices[k] + tile.position.x) / e.data[2],
                                    (tileVertices[k + 1] - tile.position.z) / e.data[2])
                                    * e.data[1];
        }

        tile.geometry.attributes.position.needsUpdate = true; // Update tile vertices
        tile.geometry.computeVertexNormals(); // Update tile vertex normals

        return tile;
    }
  })