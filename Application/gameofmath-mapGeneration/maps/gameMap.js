const Perlin = require('./perlin');
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

    /**
     * Return the good color of the soil and minimum height for a given perlin height
     * @param height the perlin height to check
     * @returns {[string, number]} an array that contain the color in first position and the minimum size in second
     * position
     */
    this.colorForHeight = function (height) {
        if (height > 0.8) {
            if(height>0.81){
                if(height>0.88){
                    if(height>0.89){
                        return ['#ffffff', 80]
                    }else{
                        return ['#A8A59C', 80]
                    }
                }else{
                    return ['#608038',80]
                }
            }else{
                return ['#c2b280', 80]
            }

        }else{
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
     * Legacy
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
        let perlinAtPos = ((this.perlin.perlin(posX , posY,32)+this.perlin.perlin(posX,posY,16)*0.5+this.perlin.perlin(posX,posY,8)*0.25))
        perlinAtPos = (perlinAtPos+1)/2
        perlinAtPos = Math.pow(perlinAtPos,0.2)
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
        return [Math.max(perlinAt*100, out[1]), out[0]]
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
    this.innerRecu = function(left, right, top, bottom, sizeX, sizeY, recu, colors) {
        let perlinAt = this.perlinAtPos(left.x, left.y, sizeX, sizeY)
        let out = this.colorForHeight(perlinAt)
        let colourLeft = out[0]

        perlinAt = this.perlinAtPos(right.x, right.y, sizeX, sizeY)
        out = this.colorForHeight(perlinAt)
        let colourRight = out[0]

        perlinAt = this.perlinAtPos(top.x, top.y, sizeX, sizeY)
        out = this.colorForHeight(perlinAt)
        let colourTop = out[0]

        perlinAt = this.perlinAtPos(bottom.x, bottom.y, sizeX, sizeY)
        out = this.colorForHeight(perlinAt)
        let colourBottom = out[0]


        if (recu != 0) {
            let posX = bottom.x + ((top.x - bottom.x)/2)
            let posY = bottom.y + ((top.y - bottom.y)/2)
            let heightAndColor1 = this.heightAndColorAtPos(posX, posY, sizeX, sizeY)
            let centerOpp = new THREE.Vector3(posX, posY, heightAndColor1[0])

            posX = (left.x + top.x) / 2
            posY = (left.y + top.y) / 2
            let heightAndColor2 = this.heightAndColorAtPos(posX, posY, sizeX, sizeY)
            let centerTopLeft = new THREE.Vector3(posX, posY, heightAndColor2[0])

            posX = (top.x + right.x) / 2
            posY = (top.y + right.y) / 2
            let heightAndColor3 = this.heightAndColorAtPos(posX, posY, sizeX, sizeY)
            let centerTopRight = new THREE.Vector3(posX, posY, heightAndColor3[0])

            posX = (bottom.x + left.x) / 2
            posY = (bottom.y + left.y) / 2
            let heightAndColor4 = this.heightAndColorAtPos(posX, posY, sizeX, sizeY)
            let centerBottomLeft = new THREE.Vector3(posX, posY, heightAndColor4[0])

            posX = (bottom.x + right.x) / 2
            posY = (bottom.y + right.y) / 2
            let heightAndColor5 = this.heightAndColorAtPos(posX, posY, sizeX, sizeY)
            let centerBottomRight = new THREE.Vector3(posX, posY, heightAndColor5[0])

            this.innerRecu(left, centerOpp, centerTopLeft, centerBottomLeft, sizeX, sizeY, recu - 1, colors)
            this.innerRecu(centerOpp, right, centerTopRight, centerBottomRight, sizeX, sizeY, recu - 1, colors)
            this.recuTriangle(top, centerOpp, centerTopLeft,sizeX,sizeY,recu-1,colors)
            this.recuTriangle(top, centerTopRight, centerOpp,sizeX,sizeY,recu-1,colors)
            this.recuTriangle(centerBottomLeft, centerOpp, bottom,sizeX,sizeY,recu-1,colors)
            this.recuTriangle(bottom, centerOpp, centerBottomRight,sizeX,sizeY,recu-1,colors)
        } else {
            let key
            key = this.moyColor(this.moyColor(colourLeft, colourTop), colourBottom)
            if (colors.get(key.getHex())==null) colors.set(key.getHex(), new Array())
            colors.get(key.getHex()).push([left, top, bottom])

            key = this.moyColor(this.moyColor(colourTop, colourRight), colourBottom)
            if (colors.get(key.getHex())==null) colors.set(key.getHex(), new Array())
            colors.get(key.getHex()).push([top, right, bottom])
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
    this.recuTriangle = function(t1,t2,t3,sizeX,sizeY,recu,colors){
        if(recu!=0){
            let centerPosX = t3.x + ((t2.x - t3.x)/2)
            let centerPosY = t3.y + ((t2.y - t3.y)/2)
            let centerOpColor = this.heightAndColorAtPos(centerPosX,centerPosY,sizeX,sizeY)
            let centerOpp = new THREE.Vector3((t2.x + t3.x)/2, (t2.y + t3.y)/2,centerOpColor[0])

            let downPointColor = this.heightAndColorAtPos((t1.x + t3.x) / 2,(t1.y + t3.y) / 2,sizeX,sizeY)
            let downPoint = new THREE.Vector3((t1.x + t3.x) / 2, (t1.y + t3.y) / 2,downPointColor[0])

            let upPointColor = this.heightAndColorAtPos((t1.x + t2.x) / 2,(t1.y + t2.y) / 2,sizeX,sizeY)
            let upPoint = new THREE.Vector3((t1.x + t2.x) / 2, (t1.y + t2.y) / 2,upPointColor[0])

            this.recuTriangle(t2,centerOpp,upPoint,sizeX,sizeY,recu-1,colors)
            this.recuTriangle(downPoint,centerOpp,t3,sizeX,sizeY,recu-1,colors)
            this.innerRecu(t1, centerOpp, upPoint, downPoint, sizeX, sizeY, recu-1, colors)
        }else{
            let colorT1 = this.heightAndColorAtPos(t1.x,t1.y,sizeX,sizeY)
            let colorT2 = this.heightAndColorAtPos(t2.x,t2.y,sizeX,sizeY)
            let colorT3 = this.heightAndColorAtPos(t3.x,t3.y,sizeX,sizeY)
            let key
            key = this.moyColor(this.moyColor(colorT1[1], colorT2[1]), colorT3[1])
            if (colors.get(key.getHex())==null) colors.set(key.getHex(), new Array())
            colors.get(key.getHex()).push([t1, t2, t3])
        }

    }


    this.sizeX=sizeX
    this.sizeY=sizeY

    //Compute the starting points of the map
    let startpos = this.computePointsStartingPosition(nbPoints, sizeX,sizeY);
    //Create a delaunay graph based on the generated points
    this.delaunay = ddelaunay.Delaunay.from(startpos)

    let colors = new Map();
    //Retrieve the data from the delaunay graph
    let {points, triangles} = this.delaunay;

    //For each triangles in the delaunay graph
    for (let i = 0; i < triangles.length; i += 3) {
        let colort1 = this.heightAndColorAtPos(points[triangles[i] * 2],points[triangles[i] * 2 + 1],sizeX,sizeY)
        let t1 = new THREE.Vector3(points[triangles[i] * 2], points[triangles[i] * 2 + 1],colort1[0])

        let colort2 = this.heightAndColorAtPos(points[triangles[i + 1] * 2],points[triangles[i + 1] * 2 + 1],sizeX,sizeY)
        let t2 = new THREE.Vector3(points[triangles[i + 1] * 2], points[triangles[i + 1] * 2 + 1],colort2[0])

        let colort3 = this.heightAndColorAtPos(points[triangles[i + 2] * 2],points[triangles[i + 2] * 2 + 1],sizeX,sizeY)
        let t3 = new THREE.Vector3(points[triangles[i + 2] * 2], points[triangles[i + 2] * 2 + 1],colort3[0])

        this.recuTriangle(t1,t2,t3,sizeX,sizeY,2,colors)
    }
    //Store locally the map as an array
    this.vertices = Array.from(colors)

}

module.exports = GameMap;