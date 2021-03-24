/**
 * A class that represent a perlin map with a random and unique gradient defined at the creation of the object
 * @param xSize the x size of the perlin map
 * @param ySize the y size of the perlin map
 */
let Perlin = function (xSize, ySize) {

    this.gradient = new Array(512)
    for(let i=0;i<256;i++){
        let ran = Math.trunc(Math.random()*256)
        this.gradient[i]=ran;
        this.gradient[256+i] = ran;
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
        let tempX,tempY;
        let x0,y0,ii,jj,gi0,gi1,gi2,gi3;
        let unit = 1.0/Math.sqrt(2);
        let tmp,s,t,u,v,Cx,Cy,Li1,Li2;
        let gradient2 = [[unit,unit],[-unit,unit],[unit,-unit],[-unit,-unit],[1,0],[-1,0],[0,1],[0,-1]];

        //Adapter pour la résolution
        x /= res;
        y /= res;

        //On récupère les positions de la grille associée à (x,y)
        x0 = Math.trunc(x);
        y0 = Math.trunc(y);

        //Masquage
        ii = x0 & 255;
        jj = y0 & 255;

        //Pour récupérer les vecteurs
        gi0 = this.gradient[ii + this.gradient[jj]] % 8;
        gi1 = this.gradient[ii + 1 + this.gradient[jj]] % 8;
        gi2 = this.gradient[ii + this.gradient[jj + 1]] % 8;
        gi3 = this.gradient[ii + 1 + this.gradient[jj + 1]] % 8;

        //on récupère les vecteurs et on pondère
        tempX = x-x0;
        tempY = y-y0;
        s = gradient2[gi0][0]*tempX + gradient2[gi0][1]*tempY;

        tempX = x-(x0+1);
        tempY = y-y0;
        t = gradient2[gi1][0]*tempX + gradient2[gi1][1]*tempY;

        tempX = x-x0;
        tempY = y-(y0+1);
        u = gradient2[gi2][0]*tempX + gradient2[gi2][1]*tempY;

        tempX = x-(x0+1);
        tempY = y-(y0+1);
        v = gradient2[gi3][0]*tempX + gradient2[gi3][1]*tempY;


        //Lissage
        tmp = x-x0;
        Cx = 3 * tmp * tmp - 2 * tmp * tmp * tmp;

        Li1 = s + Cx*(t-s);
        Li2 = u + Cx*(v-u);

        tmp = y - y0;
        Cy = 3 * tmp * tmp - 2 * tmp * tmp * tmp;

        return Li1 + Cy*(Li2-Li1);
    }

};

module.exports = Perlin;

