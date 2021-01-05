/**
 * Setup of the constants
 */
const express = require('express')
const fs = require('fs')
const router = express.Router()
const pathApp = require('path')

/**
 * Return the script to include in the webpage with the right address where to get the data of the map
 * @param path the path where the client need to make a GET to retrieve the map infos
 * @returns {string} a string that contain the script to send to the user
 */
function getMap(path){
    let file = fs.readFileSync(pathApp.join(__dirname,'./utils/renderer.js'))
    return file.toString().replace("__insert__",path)
}

/**
 * Router of the module for retrieving the renderer script of the application
 */
router.get('/renderer', async function (req, res, next) {
    res.type('js')
    res.send( getMap(req.baseUrl+"/map"))
    //,three:fs.readFileSync(pathApp.join(__dirname,'./utils/three.js')).toString()}
});

router.get('/three', async function (req, res, next) {
    res.type('js')
    res.send( fs.readFileSync(pathApp.join(__dirname,'./utils/three.js')).toString())
});


module.exports = function(method){
    router.get('/map',(req,res,next)=>{
        let result = method()
        res.send(result)
    })
    return router
};