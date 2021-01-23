const express = require('express')
const router = express.Router()
const fs = require('fs')

const renderApi = require('gameofmath-mapGeneration')

const userRouter = require('./user')
const quizRouter = require('./quiz')
const teacherRouter = require('./teacher')
const studentRouter = require('./student')
const classManagementRouter = require('./classManagement')
const quizManagementRouter = require('./quizManagement')
router.use('/user/', userRouter)
router.use('/quiz/', quizRouter)
router.use('/teacher/', teacherRouter)
router.use('/student/', studentRouter)
router.use('/classManagement/', classManagementRouter)
router.use('/quizManagement/', quizManagementRouter)

router.use('/graphics', renderApi.router)

renderApi.setupRouter(function(req,res){


    if (req.session.isLogged) {

        if (req.session.isStudent) {
            const path = './files/maps/m'+req.session.user.theClass+'.json'
            if (fs.existsSync(path)) {

                res.send(fs.readFileSync(path))
            }
        }

    }
    res.send(renderApi.createMap(1000,1000,10000))
})




module.exports = router;