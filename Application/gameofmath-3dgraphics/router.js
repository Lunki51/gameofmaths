const express  = require('express');
const Perlin = require('./perlin');
const router = express.Router();

router.get('/create/:posX/:posY',async function(req,res){
    let perl = new Perlin(100,100);
    let result = perl.perlin(req.params.posX,req.params.posY)
    res.send("Test : "+result);
})

router.get('/retrieve',async function(){

})

module.exports = router;