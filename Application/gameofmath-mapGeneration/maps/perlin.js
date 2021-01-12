/**
 * A class that represent a perlin map with a random and unique gradient defined at the creation of the object
 * @param xSize the x size of the perlin map
 * @param ySize the y size of the perlin map
 */
let Perlin = function (xSize, ySize) {

    this.gradient = [];
    for (let i = 0; i < xSize; i++) {
        let array = [];
        for (let j = 0; j < ySize; j++) {
            let innerArray = [];
            innerArray.push(Math.random() * 2 - 1, Math.random() * 2 - 1);
            array.push(innerArray)
        }
        this.gradient.push(array);
    }

    /**
     * Linear interpolate between two points
     * @param a0 the x point to interpolate
     * @param a1 the y point to interpolate
     * @param w the interpolant
     * @returns {number} the midway point
     */
    this.lerp = function (a0,a1,w){
        return (1.0-w)*a0+w*a1;
    }

    /**
     * Compute the dot product between the gradient and the point
     * @param ix x indice of the gradient map
     * @param iy y indice of the gradient map
     * @param x X position of the perlin noise researched
     * @param y Y position of the perlin noise researched
     * @returns {number} the dot product
     */
    this.dotGridGradient = function (ix,iy,x,y){
        let dx = x - ix;
        let dy = y- iy;
        return (dx*this.gradient[iy][ix][0]+dy*this.gradient[iy][ix][1]);
    }


    /**
     * Compute the perlin value for a specified location
     * @param x the x position
     * @param y the y position
     * @param res the resolution of the perlin map
     * @returns {number} the perlin value at the specified location
     */
    this.perlin = function (x,y,res){
        x /= res;
        y /= res;
        let x0 = Math.floor(x)
        let x1 = x0+1;
        let y0 = Math.floor(y)
        let y1=y0+1;

        let sx = x-x0;
        let sy = y-y0;

        let n0,n1,ix0,ix1,value;
        n0 = this.dotGridGradient(x0, y0, x, y);
        n1 = this.dotGridGradient(x1, y0, x, y);
        ix0 = this.lerp(n0, n1, sx);
        n0 = this.dotGridGradient(x0, y1, x, y);
        n1 = this.dotGridGradient(x1, y1, x, y);
        ix1 = this.lerp(n0, n1, sx);
        value = this.lerp(ix0, ix1, sy);

        return value;
    }

};

module.exports = Perlin;

