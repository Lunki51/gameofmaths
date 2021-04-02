const express = require('express')
const router = express.Router()

const user_dao = require('gameofmath-db').user_dao
const student_dao = require('gameofmath-db').student_dao
const teacher_dao = require('gameofmath-db').teacher_dao
const crypto = require('crypto')

/**
 * Connect the user.
 *
 * @param username login of the user
 * @param password password of the user
 * @return
 *  0: username: login of the user, type: 'student' or 'teacher'
 *  1: if the username or the password is incorrect
 */
router.post('/auth', (req, res, next) => {
    if (req.session.isLogged) return next(new Error('Client already logged'))

    const username = req.body.username;
    const password = req.body.password;
    if (username == null || password == null) return res.send({returnState: 1, msg: 'Mot de passe ou nom d\'utilisateur incorrect.'})

    student_dao.findUserByLogin(username).then(user => {

        if (user != null && crypto.createHash('sha512').update(password, 'utf-8').digest('hex') === user.password) {
            req.session.user = user
            req.session.isLogged = true
            req.session.isStudent = true
            req.session.isTeacher = false

            return res.send({returnState: 0, username: user.login, type: 'student'})
        } else {

            teacher_dao.findUserByLogin(username).then(user => {
                if (user != null && crypto.createHash('sha512').update(password, 'utf-8').digest('hex') === user.password) {
                    req.session.user = user
                    req.session.isLogged = true
                    req.session.isStudent = false
                    req.session.isTeacher = true

                    res.send({returnState: 0, username: user.login, type: 'teacher'})
                } else res.send({returnState: 1, msg: 'Mot de passe ou nom d\'utilisateur incorrect.'})
            }).catch(err => {
                next(err)
            })

        }
    }).catch(err => {
        next(err)
    })
})

/**
 * Check if the user is logged.
 *
 * @return
 *  0: isLogged: true if the client is logged
 */
router.post('/isLogged', (req, res, next) => {
    res.send({returnState: 0, isLogged: (req.session.isLogged) ? true : false})
})

/**
 * Get the username of the client.
 *
 * @return
 *  0: username: the client's username
 */
router.post('/username', (req, res, next) => {
    if (!req.session.isLogged) return next(new Error('Client must be logged'))
    res.send({returnState: 0, username: req.session.user.login})
})

/**
 * Get the type of the client.
 *
 * @return
 *  0: type: the client's type (student/teacher)
 */
router.post('/getType', (req, res, next) => {
    if (!req.session.isLogged) return next(new Error('Client must be logged'))
    res.send({returnState: 0, type: req.session.isTeacher ? 'teacher':'student'})
})

/**
 * Disconnect the client.
 *
 * @return
 *  0: redirect: the page to go after the logout
 */
router.post('/logout', (req, res, next) => {
    req.session.destroy()
    res.send({returnState: 0, redirect: 'login'})
})

/**
 * Allow the client to change his password.
 *
 * @param oldPassword old client's password
 * @param newPassword new client's password
 * @return
 *  0:
 *  1: if the old password is incorrect
 *  2: if the new password is incorrect
 */
router.post('/changePassword', (req, res, next) => {
    if (!req.session.isLogged) return next(new Error('Client must be logged'))

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    if (oldPassword != null && req.session.user.password === crypto.createHash('sha512').update(oldPassword, 'utf-8').digest('hex')) {

        if (newPassword != null && newPassword.length >= 7) {

            req.session.user.password = crypto.createHash('sha512').update(newPassword, 'utf-8').digest('hex')
            user_dao.update(req.session.user).then(() => {
                res.send({returnState: 0})
            }).catch(err => next(err))

        } else res.send({returnState: 2, msg: 'Nouveau mot de passe incorrect.'})

    } else res.send({returnState: 1, msg: 'Ancien mot de passe incorrect.'})
})

module.exports = router;