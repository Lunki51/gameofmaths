const gameMap = require('./maps/gameMap');

/**
 * The class returned by the application when asking for a new instance
 */
function GraphicsManager(){
    this.maps = [];
    this.router = require('./router')

    /**
     * Define the method to run when the application ask for a specific map
     * @param method a method to execute
     */
    this.setRendererMethod = function(method){
        this.router.get('/map',method)
    }

    /**
     * Create a new map
     * @param sizeX the X size of the map
     * @param sizeY the Y size of the map
     * @param nbPoints the number of points in the map (define the precision but make the creation an rendering longer)
     * @returns {number} the indices of the map to retrieve it later
     */
    this.createMap = function(sizeX,sizeY,nbPoints){
        this.maps.push(new gameMap(sizeX,sizeY,nbPoints))
        return this.maps.length-1;
     }

    /**
     * Return the map with the specified indice
     * @param indice the indice of the map
     * @returns {*} the map object
     */
     this.getMap = function(indice){
        return this.maps[indice];
     }
}

const instance = new GraphicsManager();
module.exports = instance;

