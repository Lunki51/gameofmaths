const express = require('express')
const router = express.Router()

router.get('/', async function (req, res, next) { //TODO manage error
    res.render('index.pug')
});

module.exports = router;