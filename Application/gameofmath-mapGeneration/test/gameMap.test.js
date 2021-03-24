const THREE = require('three')
const PoissonDiskSampling = require('poisson-disk-sampling');

const gameMap = require('../maps/gameMap');
const Perlin = require("../maps/perlin");
let aMap;
let sizeX = 1000;
let sizeY = 1000

beforeAll(async (done) => {
    aMap = new gameMap(sizeX,sizeY,10000,8);
    done();
});

test('test colorForHeight', async (done) => {
    expect(aMap.colorForHeight(0,0)).toEqual(['#c2b280', 0])
    done();
});

test('test computePointsStartingPosition', async (done) => {
    const array = aMap.computePointsStartingPosition(100,sizeX,sizeY)

    expect(array.length).toEqual(100)
    for(let i=0;i<100;i++){
        expect(array[i][0]).toBeGreaterThanOrEqual(0);
        expect(array[i][1]).toBeGreaterThanOrEqual(0);
        expect(array[i][0]).toBeLessThanOrEqual(sizeX);
        expect(array[i][1]).toBeLessThanOrEqual(sizeY);
    }
    done();
});

test('test perlinAtPos', async (done) => {
    const data = aMap.perlinAtPos(0.1,0.1,sizeX,sizeY)
    expect(data).toBeGreaterThanOrEqual(0);
    expect(data).toBeLessThanOrEqual(1)
    done();
});

test('test biomeAtPos', async (done) => {
    const data = aMap.biomeAtPos(Math.floor(Math.random() * Math.floor(sizeX - 1)),
        Math.floor(Math.random() * Math.floor(sizeY - 1)))
    expect(data).toBeGreaterThanOrEqual(0);
    expect(data).toBeLessThanOrEqual(1)
    done();
});

test('test perlinOctave', async (done) => {
    const data = aMap.perlinOctave(Math.floor(Math.random() * Math.floor(sizeX - 1)),
        Math.floor(Math.random() * Math.floor(sizeY - 1)),new Perlin(sizeX,sizeY))
    expect(data).toBeGreaterThanOrEqual(0);
    expect(data).toBeLessThanOrEqual(1)
    done();
});


test('test moyColor', async (done) => {
    const newColor = aMap.moyColor(new THREE.Color(1,1,1),new THREE.Color(255,255,255))
    expect(newColor).toEqual(new THREE.Color(128,128,128));
    done();
});

test('test heightAndColorAtPos', async (done) => {
    const data = aMap.heightAndColorAtPos(Math.floor(Math.random() * Math.floor(sizeX - 1)),
        Math.floor(Math.random() * Math.floor(sizeY - 1)),sizeX,sizeY)
    expect(data[0]).toBeGreaterThanOrEqual(0);
    expect(data[0]).toBeLessThanOrEqual(100);
    expect(data[1]).toMatch(/^#......$/);
    done();
});

test('test generateCastle', async (done) => {
    const castles = aMap.castlePosition
    expect(castles.length).toEqual(8);
    for(let i=0;i<castles.length;i++){
        expect(castles[i][0]).toBeGreaterThanOrEqual(-sizeX/2);
        expect(castles[i][1]).toBeGreaterThanOrEqual(0);
        expect(castles[i][2]).toBeGreaterThanOrEqual(-sizeY/2);
        expect(castles[i][0]).toBeLessThanOrEqual(sizeX/2);
        expect(castles[i][1]).toBeLessThanOrEqual(110);
        expect(castles[i][2]).toBeLessThanOrEqual(sizeY/2);
    }
    done();
});

test('test setupTree', async (done) => {
    let sampling = new PoissonDiskSampling({shape:[sizeX,sizeY],minDistance:5,maxDistance:10})
    sampling.fill();
    let samplingPoints = sampling.getAllPoints();
    const trees = aMap.setupTree(samplingPoints,0.8,0.9,0.5,0.75)
    done();
});