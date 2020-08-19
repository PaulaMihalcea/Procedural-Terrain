let matrixDimensions = 3;
let tileWorkersResults = [];





function main(){

    const PerlinSeed = 6 // TODO Math.floor(Math.random() * 65536) + 1; // Perlin noise seed (from 1 to 65536)

    let maxHeight = 0.5; // Maximum terrain height
    let smoothness = 1; // Terrain smoothness

    const tileLength = 10; // Tile length
    const tileSegments = 500; // Tile segments
    let terrainColor = 0x386653; // Terrain base color

    let iIndex = -1;



    let tileWorkers = [];


    for (let k = 0; k < matrixDimensions; k++){
        tileWorkersResults[k] = k;
    }

    function setVertices(e){
        tileWorkersResults.push(e.data[0])
        //console.log(e.data[0])
        console.log(tileWorkersResults)
    }




    for(let i=0; i<15;i++){

        for (let k = 0; k < matrixDimensions; k++) {
            tileWorkers[k] = new Worker('tileWorker.js');

            tileWorkers[k].addEventListener('message', setVertices, true);

            tileWorkers[k].postMessage([PerlinSeed, maxHeight, smoothness, tileLength, tileSegments, terrainColor, k, iIndex])
        }

    }

}

function viewResults(tileWorkersResults){
    for (let k = 0; k < matrixDimensions; k++) {
        console.log(tileWorkersResults[k])
    }
}

main();

viewResults(tileWorkersResults);