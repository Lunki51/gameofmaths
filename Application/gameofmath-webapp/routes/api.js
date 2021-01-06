const express = require('express')
const router = express.Router()

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



module.exports = router;