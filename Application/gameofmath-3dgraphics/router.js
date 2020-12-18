const express = require('express')
const fs = require('fs')
const router = express.Router()

function getMap(path){
    let file = fs.readFileSync(__dirname+'\\utils\\renderer.js')
    return file.toString().replace("__insert__",path)
}

router.get('/renderer', async function (req, res, next) {
    res.send( getMap(req.baseUrl+"/map"))
});

module.exports = router;