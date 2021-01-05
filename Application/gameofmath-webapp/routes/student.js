const express = require('express')
const router = express.Router()

const student_dao = require('gameofmath-db').student_dao
const mpGain_dao = require('gameofmath-db').mpGain_dao

/**
 * Get the MP.
 *
 * @return
 *  0: mp: the number of MP of the student
 */
router.post('/getMP', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isStudent) return next(new Error('Client must be logged on a student account'))

    student_dao.findByID(req.session.user.userID).then(student => {
        if (student == null) next(new Error('The student can\'t be found'))
        else {
            req.session.user.mp = student.mp
            res.send({returnState: 0, mp: student.mp})
        }
    }).catch(err => next(err))
})

/**
 * Get the MP of the student in function of time.
 *
 * @return
 *  0: mp: the gain of the student with his timestamp
 */
router.post('/getMPArray', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isStudent) return next(new Error('Client must be logged on a student account'))

    mpGain_dao.findAllByStudent(req.session.user.userID).then(gains => {
        res.send({
            returnState: 0, mp: gains.map(o => {
                return {
                    gain: o.amount,
                    time: new Date(o.date).getTime()
                }
            })
        })
    }).catch(err => next(err))
})

module.exports = router;