const express = require('express')
const router = express.Router()
const fs = require('fs')

const renderApi = require('gameofmath-mapGeneration')

const userRouter = require('./user')
const quizRouter = require('./quiz')
const teacherRouter = require('./teacher')
const studentRouter = require('./student')
const classManagementRouter = require('./classManagement')
router.use('/user/', userRouter)
router.use('/quiz/', quizRouter)
router.use('/teacher/', teacherRouter)
router.use('/student/', studentRouter)
router.use('/classManagement/', classManagementRouter)

const class_dao = require('gameofmath-db').class_dao
router.use('/graphics', renderApi.router)

renderApi.setupRouter(function(req){
    if (req.session.isLogged) {

        if (req.session.isStudent) {
            const path = './files/maps/m'+req.session.user.theClass+'.json'
            if (fs.existsSync(path)) {
                return fs.readFileSync(path)
            }
        }

    }
    return renderApi.createMap(200,200,10000)
})




module.exports = router;