const Perlin = require('./perlin');
const ddelaunay = require('d3-delaunay');
const THREE = require('three')
const PoissonDiskSampling = require('poisson-disk-sampling');


/**
 * Represent a map in the application
 * @param sizeX the x size of the map
 * @param sizeY the y size of the map
 * @param nbPoints the number of points in the map
 */
let GameMap = function (sizeX, sizeY, nbPoints) {
    this.heightPerlin = new Perlin(sizeX, sizeY);
    this.biomePerlin = new Perlin(sizeX,sizeY);

    /**
     * Return the good color of the soil and minimum height for a given perlin height
     * @param height the perlin height to check
     * @returns {[string, number]} an array that contain the color in first position and the minimum size in second
     * position
     */
    this.colorForHeight = function (height,biome) {
        if (height > 0.805) {
            if (height > 0.89) {
                if (height > 1) {
                    //SNOW
                    return ['#ffffff', 80]
                } else {
                    if(biome>0.33){
                        if(biome>0.66){
                            //MOUTAINS
                            return ['#A8A59C', 80]
                        }else{
                            //TUNDRA
                            return ['#d9c5a9',80]
                        }
                    }else{
                        //TAIGA
                            return ['#295D52',80]
                    }

                }
            } else {
                if(biome>0.25){
                    if(biome>0.5){
                        if(biome>0.75){
                            //FOREST
                            return ['#2cb42c', 0]
                        }else{
                            //GRASSLAND
                            return ['#608038', 0]
                        }
                    }else{
                        //SAVANNA
                        return ['#bd8d5b',0]
                    }
                }else{
                    //DESERT
                    return ['#c2b280', 0]
                }
            }
        } else {
            //SAND
            return ['#c2b280', 0]
        }
    }

    /**
     * Local method used to compute the starting points of the map graph randomly
     * @param nbPoints the number of points to place
     * @param sizeX the x size of the map
     * @param sizeY the y size of the map
     * @returns {[]} an array that represent the position of all the marked points
     */
    this.computePointsStartingPosition = function (nbPoints, sizeX, sizeY) {
        let markedPoints = [];

        for (let i = 0; i < nbPoints;) {
            let posX = Math.floor(Math.random() * Math.floor(sizeX - 1));
            let posY = Math.floor(Math.random() * Math.floor(sizeY - 1));
            if (!markedPoints.includes([posX, posY])) {
                markedPoints.push([posX, posY]);
                i++;
            }
        }

        return markedPoints;
    }

    /**
     * Legacy
     * Move the specified points with lloyd relaxation
     * @param points the points to edit
     */
    this.LloydRelax = function (points) {
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                let cell = this.delaunay.find(i, j);
                points[cell] = (points[cell * 2] + i) / 2
                points[cell + 1] = (points[cell * 2 + 1] + j) / 2
            }
        }
    }

    /**
     * Compute the perlin value at the specified position with reduction on the edges to avoid moutains on the side
     * of the map
     * @param posX the X position where to compute the perlin noise
     * @param posY the Y position where to compute the parlin noise
     * @param sizeX the x size of the map
     * @param sizeY the y size of the map
     * @returns {*|number} the perlin value at the position
     */
    this.perlinAtPos = function (posX, posY, sizeX, sizeY) {
        let perlinAtPos = this.perlinOctave(posX,posY,this.heightPerlin)
        perlinAtPos = Math.pow(perlinAtPos, 0.2)
        let ratio = 1 - ((posX - sizeX / 2) * (posX - sizeX / 2) + (posY - sizeY / 2) * (posY - sizeY / 2)) / (sizeX* sizeY);
        perlinAtPos *= ratio
        if (perlinAtPos > 0.88) {
            perlinAtPos = 0.88 + Math.pow(perlinAtPos, 5) - Math.pow(0.88, 5)
        }
        return perlinAtPos
    }

    this.biomeAtPos = function(posX,posY){
        let perlinAtPos = this.perlinOctave(posX,posY,this.biomePerlin);
        return perlinAtPos;
    }

    this.perlinOctave = function(posX,posY,perlin){
        let perlinAtPos = perlin.perlin(posX, posY, 128) + perlin.perlin(posX, posY, 64) * 0.5 + perlin.perlin(posX, posY, 32) * 0.25 + perlin.perlin(posX, posY, 16) * 0.125  + perlin.perlin(posX, posY, 8) * 0.0625 + perlin.perlin(posX, posY, 4) * 0.03125
        return (perlinAtPos + 1) / 2
    }

    /**
     * Blend two colors to make a new one
     * @param colour1 the first color to blend
     * @param colour2 the second color to blend
     * @returns {Color} the new color
     */
    this.moyColor = function (colour1, colour2) {
        let colourOne = new THREE.Color(colour1)
        let colourTwo = new THREE.Color(colour2)
        return new THREE.Color((colourOne.r + colourTwo.r) / 2, (colourOne.g + colourTwo.g) / 2, (colourOne.b + colourTwo.b) / 2)
    }

    /**
     * Return the height and the color of a point at a specified position
     * @param posX the x position
     * @param posY the y position
     * @param sizeX the x size of the map
     * @param sizeY the y size of the map
     * @returns {[number, *]} an array that contains the height at position 0 and the color at position 1
     */
    this.heightAndColorAtPos = function (posX, posY, sizeX, sizeY) {
        let heihtNoise = this.perlinAtPos(posX, posY, sizeX, sizeY)
        let biomeNoise = this.biomeAtPos(posX,posY);
        let out = this.colorForHeight(heihtNoise,biomeNoise)
        return [Math.max(heihtNoise * 100, out[1]), out[0]]
    }

    /**
     * Recursive method to compute more precise triangles in a diamond shape
     * @param left the left point of the diamond
     * @param right the right point of the diamond
     * @param top the top point of the diamond
     * @param bottom the bottom point of the diamond
     * @param sizeX the X size of the global map model
     * @param sizeY the Y size of the global map model
     * @param recu a number representing the number of times the recursive function as to iterate before adding
     * triangles, the more means a better definition but longer generation time
     * @param colors a map that contains the points for each colors used to return the computed data
     */
    this.innerRecu = function (left, right, top, bottom, sizeX, sizeY, recu, colors) {
        if (recu != 0) {
            let posX = bottom.x + ((top.x - bottom.x) / 2)
            let posY = bottom.y + ((top.y - bottom.y) / 2)
            let centerOpp = new THREE.Vector2(posX, posY)

            posX = (left.x + top.x) / 2
            posY = (left.y + top.y) / 2
            let centerTopLeft = new THREE.Vector2(posX, posY)

            posX = (top.x + right.x) / 2
            posY = (top.y + right.y) / 2
            let centerTopRight = new THREE.Vector2(posX, posY)

            posX = (bottom.x + left.x) / 2
            posY = (bottom.y + left.y) / 2
            let centerBottomLeft = new THREE.Vector3(posX, posY)

            posX = (bottom.x + right.x) / 2
            posY = (bottom.y + right.y) / 2
            let centerBottomRight = new THREE.Vector3(posX, posY)

            this.innerRecu(left, centerOpp, centerTopLeft, centerBottomLeft, sizeX, sizeY, recu - 1, colors)
            this.innerRecu(centerOpp, right, centerTopRight, centerBottomRight, sizeX, sizeY, recu - 1, colors)
            this.recuTriangle(top, centerOpp, centerTopLeft, sizeX, sizeY, recu - 1, colors)
            this.recuTriangle(top, centerTopRight, centerOpp, sizeX, sizeY, recu - 1, colors)
            this.recuTriangle(centerBottomLeft, centerOpp, bottom, sizeX, sizeY, recu - 1, colors)
            this.recuTriangle(bottom, centerOpp, centerBottomRight, sizeX, sizeY, recu - 1, colors)
        } else {
            this.recuTriangle(left,top,bottom,sizeX,sizeY,0,colors)
            this.recuTriangle(top,right,bottom,sizeX,sizeY,0,colors)
        }

    }

    /**
     * Recursive method to compute more precise triangles in a triangle shape
     * @param t1 the first point of the triangle
     * @param t2 the second point of the triangle
     * @param t3 the third point of the triangle
     * @param sizeX the X size of the global map model
     * @param sizeY the Y size of the global map model
     * @param recu a number representing the number of times the recursive function as to iterate before adding
     * triangles, the more means a better definition but longer generation time
     * @param colors a map that contains the points for each colors used to return the computed data
     */
    this.recuTriangle = function (t1, t2, t3, sizeX, sizeY, recu,colors) {
        if (recu != 0) {
            let centerOpp = new THREE.Vector2((t2.x + t3.x) / 2, (t2.y + t3.y) / 2)
            let downPoint = new THREE.Vector2((t1.x + t3.x) / 2, (t1.y + t3.y) / 2)
            let upPoint = new THREE.Vector2((t1.x + t2.x) / 2, (t1.y + t2.y) / 2)

            this.recuTriangle(t2, centerOpp, upPoint, sizeX, sizeY, recu - 1, colors)
            this.recuTriangle(downPoint, centerOpp, t3, sizeX, sizeY, recu - 1, colors)
            this.innerRecu(t1, centerOpp, upPoint, downPoint, sizeX, sizeY, recu - 1, colors)
        } else {
            let colorT1 = this.heightAndColorAtPos(t1.x, t1.y, sizeX, sizeY)
            let colorT2 = this.heightAndColorAtPos(t2.x, t2.y, sizeX, sizeY)
            let colorT3 = this.heightAndColorAtPos(t3.x, t3.y, sizeX, sizeY)
            let key
            key = this.moyColor(this.moyColor(colorT1[1], colorT2[1]), colorT3[1])
            if (colors.get(key.getHex()) == null) colors.set(key.getHex(), [new Array(),new Array()])
            let vec1 = new THREE.Vector3(t1.x-sizeX/2,colorT1[0],t1.y - sizeY / 2)
            let vec2 = new THREE.Vector3(t2.x-sizeX/2,colorT2[0],t2.y- sizeY / 2)
            let vec3 = new THREE.Vector3(t3.x-sizeX/2,colorT3[0],t3.y- sizeY / 2)
            colors.get(key.getHex())[0].push(vec1.x,vec1.y,vec1.z,vec2.x,vec2.y,vec2.z,vec3.x,vec3.y,vec3.z)
            let ab = new THREE.Vector3()
            let cb = new THREE.Vector3()
            ab.subVectors(vec1, vec2)
            cb.subVectors(vec3, vec2)
            cb.cross(ab)
            cb.normalize()
            for (let j = 0; j < 3; j++) {
                colors.get(key.getHex())[1].push(cb.x,cb.y,cb.z)
            }

        }

    }

    this.generateCastle = function(startPoints,nbCastle){
        let castlePositions = new Array();
        while(nbCastle>0){
            let position = Math.round(Math.random()*startPoints.length);
            let height = this.heightAndColorAtPos(startPoints[position][0],startPoints[position][1],this.sizeX,this.sizeY)
            let perlin = this.perlinAtPos(startPoints[position][0],startPoints[position][1],this.sizeX,this.sizeY)
            if(!castlePositions.includes(startPoints[position]) && perlin>0.80){
                castlePositions.push([startPoints[position][0]-sizeX/2,height[0],startPoints[position][1]-sizeY/2])
                nbCastle--;
            }
        }
        return castlePositions;
    }

    this.setupTree = function(points,minHeight,maxHeight,minBiome,maxBiome){
        let pointsArray = new Array();
        for(let i=0;i<points.length;i++){
            let perlinValue = this.perlinAtPos(points[i][0],points[i][1],sizeX,sizeY)
            let biome = this.biomeAtPos(points[i][0],points[i][1]);
            if(perlinValue>minHeight && perlinValue<maxHeight && biome>minBiome && biome<maxBiome){
                pointsArray.push(new THREE.Vector3(points[i][0]-sizeX/2,perlinValue*100,points[i][1]-sizeY/2))
            }
        }
        return pointsArray;
    }

    let sampling = new PoissonDiskSampling({shape:[sizeX,sizeY],minDistance:5,maxDistance:10})
    sampling.fill();
    let samplingPoints = sampling.getAllPoints();
    this.forestTrees = this.setupTree(samplingPoints,0.8,0.9,0.5,0.75)

    sampling = new PoissonDiskSampling({shape:[sizeX,sizeY],minDistance:10,maxDistance:15})
    sampling.fill();
    samplingPoints = sampling.getAllPoints();
    this.savannaTrees = this.setupTree(samplingPoints,0.8,0.9,0.25,0.5)

    sampling = new PoissonDiskSampling({shape:[sizeX,sizeY],minDistance:15,maxDistance:20})
    sampling.fill();
    samplingPoints = sampling.getAllPoints();
    this.plainTrees = this.setupTree(samplingPoints,0.8,0.9,0.75,1)



    this.sizeX = sizeX
    this.sizeY = sizeY

    //Compute the starting points of the map
    let startpos = this.computePointsStartingPosition(nbPoints, sizeX, sizeY);
    //Create a delaunay graph based on the generated points
    this.delaunay = ddelaunay.Delaunay.from(startpos)

    this.castlePosition = this.generateCastle(startpos,8)
    //Retrieve the data from the delaunay graph
    let {points, triangles} = this.delaunay;

    let colors = new Map();

    //For each triangles in the delaunay graph
    for (let i = 0; i < triangles.length; i += 3) {
        let t1 = new THREE.Vector2(points[triangles[i] * 2], points[triangles[i] * 2 + 1])
        let t2 = new THREE.Vector2(points[triangles[i + 1] * 2],  points[triangles[i + 1] * 2 + 1])
        let t3 = new THREE.Vector2(points[triangles[i + 2] * 2] , points[triangles[i + 2] * 2 + 1])
        this.recuTriangle(t1, t2, t3, sizeX, sizeY, 2,colors)
    }

    this.colors = Array.from(colors);
}

module.exports = GameMap;