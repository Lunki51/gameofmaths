const gameMap = require('./maps/gameMap');

function GraphicsManager(){
    this.maps = [];

    this.createMap = function(sizeX,sizeY,nbPoints){
        this.maps.push(new gameMap(sizeX,sizeY,nbPoints))
        return this.maps.length-1;
     }

     this.getMap = function(indice){
        return this.maps[indice];
     }

     this.getInstance = function(){
        return this;
     }

}
const instance = new GraphicsManager();
module.exports = instance;

