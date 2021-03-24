const express = require('express')
const router = express.Router()

const teacher_dao = require('gameofmath-db').teacher_dao

/**
 * Allow the teacher to change is mail.
 *
 * @param newMail new teacher's mail
 * @return
 *  0:
 *  1: New mail incorrect
 */
router.post('/changeMail', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a teacher account'))

    const newMail = req.body.newMail;

    if (newMail != null && newMail.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {

        req.session.user.email = newMail
        teacher_dao.update(req.session.user).then(() => {
            res.send({returnState: 0})
        }).catch(err => next(err))

    } else res.send({returnState: 1, msg: 'Mail incorrect.'})

})

/**
 * Allow the teacher to change is lastname.
 *
 * @param newName new teacher's lastname
 * @return
 *  0:
 *  1: New lastname incorrect
 */
router.post('/changeLastname', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a teacher account'))

    const newName = req.body.newName;

    if (newName != null && newName.length > 0) {

        req.session.user.lastname = newName
        teacher_dao.update(req.session.user).then(() => {
            res.send({returnState: 0})
        }).catch(err => next(err))

    } else res.send({returnState: 1, msg: 'Lastname incorrect.'})

})

/**
 * Allow the teacher to change is firstname.
 *
 * @param newName new teacher's firstname
 * @return
 *  0:
 *  1: New firstname incorrect
 */
router.post('/changeFirstname', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a teacher account'))

    const newName = req.body.newName;

    if (newName != null && newName.length > 0) {

        req.session.user.firstname = newName
        teacher_dao.update(req.session.user).then(() => {
            res.send({returnState: 0})
        }).catch(err => next(err))

    } else res.send({returnState: 1, msg: 'firstname incorrect.'})

})

module.exports = router;