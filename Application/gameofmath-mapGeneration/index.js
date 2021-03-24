const gameMap = require('./maps/gameMap');
const express = require('express')

/**
 * The class returned by the application when asking for a new instance
 */
function GraphicsManager(){

    this.router = express.Router();

    /**
     * Setup the router to respond to the /map request
     * This request is used when the user ask for the map
     * @param method the method to run when choosing a map for the client
     */
    this.setupRouter = function(method){
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
        return new gameMap(sizeX,sizeY,nbPoints,8)
     }

}

const instance = new GraphicsManager();
module.exports = instance;

