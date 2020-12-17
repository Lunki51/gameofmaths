
const express = require('express')
const router = express.Router()


router.get('/api/graphics/renderer/', (res,req) => {
    req.send("alert('render'); console.log('hello word');")
})


module.exports = router;


