const Perlin = require('../utils/perlin');
const ddelaunay = require('d3-delaunay');
const THREE = require('three')

/**
 * Represent a map in the application
 * @param sizeX the x size of the map
 * @param sizeY the y size of the map
 * @param nbPoints the number of points in the map
 */
let GameMap = function(sizeX,sizeY,nbPoints){
    this.perlin = new Perlin(sizeX,sizeY);
    this.colorForHeight = function (height) {
        if (height > 0.9) {
            if (height > 1) {
                if (height > 1.1) {
                    return ['#ffffff', 30]
                } else {
                    return ['#A8A59C', 25]
                }
            } else {
                return ['#608038',22]
            }

        } else if(height > 0.89) {
            return ['#c2b280', 18]
        }else{
            return ['#006994', 0]
        }
    }

    /**
     * Local method used to compute the starting points of the map graph randomly
     * @param nbPoints the number of points to place
     * @param sizeX the x size of the map
     * @param sizeY the y size of the map
     * @returns {[]} an array that represent the position of all the marked points
     */
    this.computePointsStartingPosition = function(nbPoints,sizeX,sizeY){
        let markedPoints = [];

        for(let i=0;i<nbPoints;){
            let posX = Math.floor(Math.random() * Math.floor(sizeX-1));
            let posY = Math.floor(Math.random() * Math.floor(sizeY-1));
            if(!markedPoints.includes([posX,posY])){
                markedPoints.push([posX,posY]);
                i++;
            }
        }

        return markedPoints;
    }

    /**
     * Move the specified points with lloyd relaxation
     * @param points the points to edit
     */
    this.LloydRelax = function(points){
        for(let i=0;i<100;i++){
            for(let j=0;j<100;j++){
                let cell = this.delaunay.find(i,j);
                points[cell] = (points[cell*2]+i)/2
                points[cell+1] = (points[cell*2+1]+j)/2
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
        let perlinAtPos = (this.perlin.perlin(posX  / 25, posY  / 25)+this.perlin.perlin(posX  / 70, posY  / 70)+this.perlin.perlin(posX  / 200, posY  / 200))/3 + 1
        let ratio = 1 - ((posX - sizeX / 2) * (posX - sizeX / 2) + (posY - sizeY / 2) * (posY - sizeY / 2)) / (sizeX * sizeY);
        perlinAtPos = Math.min(perlinAtPos, perlinAtPos * ratio)
        return perlinAtPos
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
        let perlinAt = this.perlinAtPos(posX, posY, sizeX, sizeY)
        let out = this.colorForHeight(perlinAt)
        let colour = out[0]
        return [out[1]>0?Math.min(perlinAt*20, out[1]):15, colour]
    }


    this.sizeX=sizeX
    this.sizeY=sizeY
    let startpos = this.computePointsStartingPosition(nbPoints, sizeX,sizeY);
    this.delaunay = ddelaunay.Delaunay.from(startpos)
    let colors = new Map();
    let {points, triangles} = this.delaunay;

    for (let i = 0; i < triangles.length; i += 3) {
        let colort1 = this.heightAndColorAtPos(points[triangles[i] * 2],points[triangles[i] * 2 + 1],sizeX,sizeY)
        let t1 = new THREE.Vector3(points[triangles[i] * 2], points[triangles[i] * 2 + 1],colort1[0])

        let colort2 = this.heightAndColorAtPos(points[triangles[i + 1] * 2],points[triangles[i + 1] * 2 + 1],sizeX,sizeY)
        let t2 = new THREE.Vector3(points[triangles[i + 1] * 2], points[triangles[i + 1] * 2 + 1],colort2[0])

        let colort3 = this.heightAndColorAtPos(points[triangles[i + 2] * 2],points[triangles[i + 2] * 2 + 1],sizeX,sizeY)
        let t3 = new THREE.Vector3(points[triangles[i + 2] * 2], points[triangles[i + 2] * 2 + 1],colort3[0])

        let key
        key = this.moyColor(this.moyColor(colort1[1], colort2[1]), colort3[1])
        if (colors.get(key.getHex())==null) colors.set(key.getHex(), new Array())
        colors.get(key.getHex()).push(t1,t2 , t3)
    }
    this.vertices = Array.from(colors)

}

module.exports = GameMap;