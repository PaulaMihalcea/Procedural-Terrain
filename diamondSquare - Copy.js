
import * as OC from "./three.js/examples/jsm/controls/OrbitControls.js"
import { VertexNormalsHelper } from './three.js/examples/jsm/helpers/VertexNormalsHelper.js';


export function diamondSquaredMap(x, y, width, height, iterations) {
    var map = fieldDiamondSquared(x, y, x+width, y+height, iterations);

    var maxdeviation = getMaxDeviation(iterations);

    for (var j = 0; j < width; j++) {
        for (var k = 0; k < height; k++) {
            map[j][k] = map[j][k] / maxdeviation;
        }
    }
    return map;

    function create2DArray(d1, d2) {
        var x = [],
                i = 0,
                j = 0;

        for (i = 0; i < d1; i += 1) {
            x[i] = [];
        }
        return x;
    }

    function fieldDiamondSquared(x0, y0, x1, y1, iterations) {
        if (x1 < x0) { return null; }
        if (y1 < y0) { return null; }
        var finalwidth  = x1 - x0;
        var finalheight = y1 - y0;
        var finalmap = create2DArray(finalwidth, finalheight);
        if (iterations === 0) {
            for (var j = 0; j < finalwidth; j++) {
                for (var k = 0; k < finalheight; k++) {
                    finalmap[j][k] =  displace(iterations,x0+j,y0+k) ;
                }
            }
            return finalmap;
        }
        var ux0 = Math.floor(x0 / 2) - 1;
        var uy0 = Math.floor(y0 / 2) - 1;
        var ux1 = Math.ceil(x1 / 2) + 1;
        var uy1 = Math.ceil(y1 / 2) + 1;
        var uppermap = fieldDiamondSquared(ux0, uy0, ux1, uy1, iterations-1);

        var uw = ux1 - ux0;
        var uh = uy1 - uy0;

        var cx0 = ux0 * 2;
        var cy0 = uy0 * 2;

        var cw = uw*2-1;
        var ch = uh*2-1;
        var currentmap = create2DArray(cw,ch);

        for (var j = 0; j < uw; j++) {
            for (var k = 0; k < uh; k++) {
                currentmap[j*2][k*2] = uppermap[j][k];
            }
        }
        var xoff = x0 - cx0;
        var yoff = y0 - cy0;
        for (var j = 1; j < cw-1; j += 2) {
            for (var k = 1; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k - 1] + currentmap[j - 1][k + 1] + currentmap[j + 1][k - 1] + currentmap[j + 1][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }
        for (var j = 1; j < cw-1; j += 2) {
            for (var k = 2; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k]     + currentmap[j + 1][k]     + currentmap[j][k - 1]     + currentmap[j][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }
        for (var j = 2; j < cw-1; j += 2) {
            for (var k = 1; k < ch-1; k += 2) {
                currentmap[j][k] = ((currentmap[j - 1][k]     + currentmap[j + 1][k]     + currentmap[j][k - 1]     + currentmap[j][k + 1]) / 4) + displace(iterations,cx0+j,cy0+k);
            }
        }

        for (var j = 0; j < finalwidth; j++) {
            for (var k = 0; k < finalheight; k++) {
                finalmap[j][k] = currentmap[j+xoff][k+yoff];
            }
        }

        return finalmap;
    }

    // Random function to offset
    function displace(iterations, x, y) {
        return (((PRH(iterations,x,y) - 0.5)*2)) / (iterations+1);
    }

    function getMaxDeviation(iterations) {
        var dev = 0.5 / (iterations+1);
        if (iterations <= 0) return dev;
        return getMaxDeviation(iterations-1) + dev;
    }

    //This function returns the same result for given values but should be somewhat random.
    function PRH(iterations,x,y) {
        var hash;
        x &= 0xFFF;
        y &= 0xFFF;
        iterations &= 0xFF;
        hash = (iterations << 24);
        hash |= (y << 12);
        hash |= x;
        var rem = hash & 3;
        var h = hash;

        switch (rem) {
            case 3:
                hash += h;
                hash ^= hash << 32;
                hash ^= h << 36;
                hash += hash >> 22;
                break;
            case 2:
                hash += h;
                hash ^= hash << 22;
                hash += hash >> 34;
                break;
            case 1:
                hash += h;
                hash ^= hash << 20;
                hash += hash >> 2;
        }
        hash ^= hash << 6;
        hash += hash >> 10;
        hash ^= hash << 8;
        hash += hash >> 34;
        hash ^= hash << 50;
        hash += hash >> 12;

        return (hash & 0xFFFF) / 0xFFFF;
    }

};





/* ******************************************************************* */
/*

let width = window.innerWidth // Browser window width
let height = window.innerHeight // Browser windows height

// Canvas
const canvas = document.querySelector('#canvas'); // HTML canvas element to use

// Renderer
let renderer = new THREE.WebGLRenderer({canvas}); // Renderer object
renderer.setSize(width, height); // Set renderer size to window size
document.body.appendChild(renderer.domElement);

// Light
const lightColor = 0xffffff; // Light color
const intensity = 1; // Light color opacity

const light = new THREE.DirectionalLight(lightColor, intensity);

// Scene
const scene = new THREE.Scene();
const sceneColor = 0x000000; // Background color

scene.background = new THREE.Color(sceneColor); // Set scene background color
scene.add(light); // Add light to the scene

// Camera
const fov = 100; // Field of view
const aspect = width / height; // Aspect ratio
const near = 0.1; // Near plane
const far = 1000; // Far plane

let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.set(0, 15, 0); // TODO Set a suitable automatic position
camera.updateProjectionMatrix();

// Fake camera
let fakeCamera = camera.clone();
camera.copy(fakeCamera);

// Controls
let controls = new OC.OrbitControls(fakeCamera, renderer.domElement);

// Event listeners
window.addEventListener('resize', onWindowResize, false); // Window resize listener

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight; // Camera aspect ratio
    camera.updateProjectionMatrix(); // Camera update
    renderer.setSize(window.innerWidth, window.innerHeight); // Renderer size
}

// Rendering
function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, fakeCamera);
}

// Animation loop
function loop() {
    //update();
    requestAnimationFrame(loop);
}















const PerlinSeed = 6 // TODO Math.floor(Math.random() * 65536) + 1; // Perlin noise seed (from 1 to 65536)

noise.seed(PerlinSeed);

let maxHeight = 0.5; // Maximum terrain height
let smoothness = 1; // Terrain smoothness




let tileSegments = 500; // Tile segments



let tileLength = tileSegments; // Tile length
let terrainColor = 0xffffff; // Terrain base color

function ciao (tileVertices, xPos, zPos) {
    for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)
        tileVertices[k + 2] = noise.perlin2(
                                (tileVertices[k] + xPos) / smoothness,
                                (tileVertices[k + 1] - zPos) / smoothness)
                                * maxHeight;
    }

    return tileVertices;
}

// Add tile
function addTile(i, j) {
    // Texture
    let loader = new THREE.TextureLoader(); // Texture loader
    let tileTexture = loader.load('textures/tileTexture.jpg');

    tileTexture.wrapS = THREE.RepeatWrapping;
    tileTexture.wrapT = THREE.RepeatWrapping;
    //tileTexture.repeat.set(8, 8);

    let tileMaterial = new THREE.MeshLambertMaterial({map: tileTexture}); // Create textured tile material


    let tileGeometry = new THREE.PlaneBufferGeometry(tileLength, tileLength, tileSegments, tileSegments); // Create tile geometry
    //let tileMaterial = new THREE.MeshLambertMaterial({color: terrainColor}); // Create tile material
    
    let xOffset = tileLength * i; // x axis offset (based on the tile's position in the matrix)
    let zOffset = tileLength * j; // z axis offset (based on the tile's position in the matrix)

    let tile = new THREE.Mesh(tileGeometry, tileMaterial); // Create tile mesh
    
    tile.position.x += xOffset -= tileLength; // x tile position (based on offset and tile length)
    tile.position.z += zOffset -= tileLength; // z tile position (based on offset and tile length)
    
    tile.rotation.x = -Math.PI / 2; // Tile rotation (for correct viewing)

    //tile.geometry.attributes.position.array = ciao(tile.geometry.attributes.position.array, tile.position.x, tile.position.z)

    tile.geometry.attributes.position.needsUpdate = true; // Update tile vertices
    //tile.geometry.computeVertexNormals(); // Update tile vertex normals

    tile.castShadow = false;

    return tile;
}




let tile00 = addTile(0, 0);
let tile01 = addTile(0,1);
let tile02 = addTile(0,2);

let tile10 = addTile(1, 0);
let tile11 = addTile(1, 1);
let tile12 = addTile(1, 2);

let tile20 = addTile(2, 0);
let tile21 = addTile(2, 1);
let tile22 = addTile(2, 2);















//console.log(tileVertices.length)

//let counterV = 0
//let counterM = 0






let iterations = 3;



function useMap(tile, i, j) {

    let xOffset = tileLength * i;
    let zOffset = tileLength * j;

    let xPos = xOffset -= tileLength;
    let zPos = zOffset -= tileLength;

    let tileVertices = tile.geometry.attributes.position.array;

    for (let k = 0; k <= tileVertices.length; k += 3) { // Elevation (Perlin noise)

        //let x = Math.floor(parseFloat(tileVertices[k] + xPos))
        //let y = Math.floor(parseFloat(tileVertices[k + 1] - zPos))

        let x = tileVertices[k] + xPos
        let y = tileVertices[k + 1] - zPos

        //console.log('x, y:', tileVertices[k] + xPos, tileVertices[k + 1] - zPos, 'rounded:', x, y)

        if (!isNaN(x) || !isNaN(y)){

            let res = diamondSquaredMap(x, y, 1, 1, iterations)[0][0]

            //console.log('res:', res * 100)

            tileVertices[k + 2] += res*5;

            //console.log(tileVertices[k + 2])

        }
        else{
            //console.log('ciao')
        }
    }

    tile.material.flatShading = false
    tile.geometry.computeVertexNormals();
    tile.geometry.computeFaceNormals();
    

}




//console.log(diamondSquaredMap(-5,5, 1, 1, iterations)[0][0])

//console.log(diamondSquaredMap(0, 0, 2, 2, 5))
//console.log(diamondSquaredMap(0, 0, 1, 1, 6))
//console.log(diamondSquaredMap(0, 1, 1, 1, 6))
//console.log(diamondSquaredMap(1, 0, 1, 1, 6))
//console.log(diamondSquaredMap(1, 1, 1, 1, 6))



useMap(tile00, 0, 0);
useMap(tile01, 0, 1);
useMap(tile02, 0, 2);
useMap(tile10, 1, 0);
useMap(tile11, 1, 1);
useMap(tile12, 1, 2);
useMap(tile20, 2, 0);
useMap(tile21, 2, 1);
useMap(tile22, 2, 2);




scene.add(tile00)
scene.add(tile01)
scene.add(tile02)
scene.add(tile10)
scene.add(tile11)
scene.add(tile12)
scene.add(tile20)
scene.add(tile21)
scene.add(tile22)









/*
var helper00 = new VertexNormalsHelper(tile00, 2, 0xff0000, 1 );
var helper01 = new VertexNormalsHelper(tile01, 2, 0xff0000, 1 );


//scene.add( helper00 );
//scene.add( helper01 );






let tileVertices00 = tile00.geometry.attributes.position.array
let tileVertices01 = tile01.geometry.attributes.position.array


for (let k = 0; k <= tileVertices00.length; k += 3) {

    let x = tileVertices00[k]
    let y = tileVertices00[k + 1]
    let z = tileVertices00[k + 2]

    console.log(x, y, z);

}


//console.log(tileVertices00[3],tileVertices00[4],tileVertices00[5])
//console.log(tileVertices01[3],tileVertices01[4],tileVertices01[5])



for (let k = 0; k <= tileVertices00.length; k += 3) {

    if (tileVertices00[k] = tileVertices01[k]){
        tileVertices01[k+2] = -tileVertices00[tileVertices00.length-k+2]
    }

    if (tileVertices00[k+1] = tileVertices01[k+1]){
        tileVertices01[k+2] = -tileVertices00[tileVertices00.length-k+2]
    }

    tile01.geometry.computeVertexNormals();
    tile01.geometry.computeFaceNormals(); 

}



console.log(tileVertices00[0],tileVertices00[4],tileVertices00[5])
console.log(tileVertices01[3],tileVertices01[4],tileVertices01[5])




loop();
render();*/