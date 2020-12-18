const Perlin = require('../utils/perlin');
const ddelaunay = require('d3-delaunay');
const THREE = require('three')

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

    this.LloydRelax = function(points){
        for(let i=0;i<100;i++){
            for(let j=0;j<100;j++){
                let cell = this.delaunay.find(i,j);
                points[cell] = (points[cell*2]+i)/2
                points[cell+1] = (points[cell*2+1]+j)/2
            }
        }
    }

    this.perlinAtPos = function (posX, posY, sizeX, sizeY) {
        let perlinAtPos = (this.perlin.perlin(posX  / 25, posY  / 25)+this.perlin.perlin(posX  / 70, posY  / 70)+this.perlin.perlin(posX  / 200, posY  / 200))/3 + 1
        let ratio = 1 - ((posX - sizeX / 2) * (posX - sizeX / 2) + (posY - sizeY / 2) * (posY - sizeY / 2)) / (sizeX * sizeY);
        perlinAtPos = Math.min(perlinAtPos, perlinAtPos * ratio)
        return perlinAtPos
    }

    this.moyColor = function (colour1, colour2) {
        let colourOne = new THREE.Color(colour1)
        let colourTwo = new THREE.Color(colour2)
        return new THREE.Color((colourOne.r + colourTwo.r) / 2, (colourOne.g + colourTwo.g) / 2, (colourOne.b + colourTwo.b) / 2)
    }

    this.heightAndColorAtPos = function (posX, posY, sizeX, sizeY) {
        let perlinAt = this.perlinAtPos(posX, posY, sizeX, sizeY)
        let out = this.colorForHeight(perlinAt)
        let colour = out[0]
        return [out[1]>0?Math.min(perlinAt*20, out[1]):15, colour]
    }

    this.getMapData = function(){
        return this.colors;
    }


    let startpos = this.computePointsStartingPosition(nbPoints, sizeX,sizeY);
    this.delaunay = ddelaunay.Delaunay.from(startpos)
    this.colors = new Map();
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
        if (this.colors.get(key.getHex())==null) this.colors.set(key.getHex(), new Array())
        this.colors.get(key.getHex()).push(t1,t2 , t3)
    }

}

module.exports = GameMap;