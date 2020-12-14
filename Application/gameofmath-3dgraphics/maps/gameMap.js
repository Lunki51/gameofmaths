const Perlin = require('../utils/perlin');
const ddelaunay = require('d3-delaunay');
const THREE = require('three')

let GameMap = function(sizeX,sizeY,nbPoints){
    this.perlin = new Perlin(sizeX,sizeY);

    let startPos = this.computePointsStartingPosition(nbPoints,sizeX,sizeY);
    this.delaunay = ddelaunay.Delaunay.from(startPos)
    this.voronoy =  this.delaunay.voronoi([0,0,sizeX,sizeY])

    this.colors = new Map();

    let polygons = this.computePolygons(this.voronoy)
    for(let polygon of polygons){
        let centerX = polygon.value[0][0]
        let centerY = polygon.value[0][1]
        for(let i=1;i<polygon.length;i++){
            centerX = (centerX+polygon.value[i][0])/2
            centerY = (centerY+polygon.value[i][1])/2
        }
        let perlinAtPos = this.perlin.perlin(centerX/sizeX*3.5,centerY/sizeY*3.5)
        perlinAtPos++;
        let canvasCenter = new THREE.Vector2(sizeX/2,sizeY/2)
        let pos = new THREE.Vector2(centerX,centerY);
        let ratio = 1-((pos.x-canvasCenter.x)*(pos.x-canvasCenter.x) + (pos.y-canvasCenter.y)*(pos.y-canvasCenter.y))/(sizeX*sizeY);
        perlinAtPos = Math.min(perlinAtPos,perlinAtPos*ratio)
        if(perlinAtPos>1){
            if(perlinAtPos>1.2){
                if(perlinAtPos>1.3){
                    this.colors.set(polygon.value,'#ffffff' )
                }else{
                    this.colors.set(polygon.value,'#A8A59C' )
                }
            }else{
                this.colors.set(polygon.value,'#608038' )
            }

        }else{
            this.colors.set(polygon.value,'#006994' )
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

    this.computePolygons = function(){
        polygons =[]
        let polygonIt = voronoy.cellPolygons();
        let polygon;
        do{
            polygon=polygonIt.next()
            polygons.push(polygon)
        }while(polygon.value!=null)
        polygons.pop()
        return polygons
    }

    this.getMapData = function(){
        return this.colors;
    }
}

module.exports = GameMap;