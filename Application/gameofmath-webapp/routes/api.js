const express = require('express')
const router = express.Router()

const userRouter = require('./user')
const quizRouter = require('./quiz')
const teacherRouter = require('./teacher')
router.use('/user/', userRouter)
router.use('/quiz/', quizRouter)
router.use('/teacher/', teacherRouter)

module.exports = router;