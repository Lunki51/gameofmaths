const express = require('express')
const router = express.Router()

const student_dao = require('gameofmath-db').student_dao
const mpGain_dao = require('gameofmath-db').mpGain_dao
const db = require('gameofmath-db').db

/**
 * Get the MP.
 *
 * @return
 *  0: mp: the number of MP of the student
 */
router.post('/getMP', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged on a student account'))

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
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged on a student account'))

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

/**
 * Get some info of the player.
 *
 * @return
 *  0: firstname, lastname, className, classGrade, classID, mp
 */
router.post('/getInfo', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged on a student account'))

    let request = 'SELECT * FROM User, Student, Class WHERE theUser = userID AND theClass = classID AND theUser = ?'
    db.all(request, [req.session.user.userID], function (err, rows) {
        if (err) next(err)
        else {

            let student = rows[0]
            if (student == null) next(new Error('The student can\'t be found'))
            else {
                req.session.user.mp = student.mp
                res.send({
                    returnState: 0,
                    firstname: student.firstname,
                    lastname: student.lastname,
                    className: student.name,
                    classGrade: student.grade,
                    classID: student.classID,
                    mp: student.mp
                })
            }

        }
    })
})

module.exports = router;