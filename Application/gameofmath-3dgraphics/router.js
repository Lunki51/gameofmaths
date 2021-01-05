/**
 * Setup of the constants
 */
const express = require('express')
const fs = require('fs')
const router = express.Router()
const path = require('path')

/**
 * Return the script to include in the webpage with the right address where to get the data of the map
 * @param path the path where the client need to make a GET to retrieve the map infos
 * @returns {string} a string that contain the script to send to the user
 */
function getMap(path){
    let file = fs.readFileSync(path.join(__dirname,'../utils/renderer.js'))
    return file.toString().replace("__insert__",path)
}

/**
 * Router of the module for retrieving the renderer script of the application
 */
router.get('/renderer', async function (req, res, next) {
    console.log(getMap(req.baseUrl+"/map"))

    res.send( getMap(req.baseUrl+"/map"))
});

module.exports = router;