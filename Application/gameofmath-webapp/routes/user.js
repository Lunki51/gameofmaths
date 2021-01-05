const express = require('express')
const router = express.Router()

const student_dao = require('gameofmath-db').student_dao
const teacher_dao = require('gameofmath-db').teacher_dao
const crypto = require('crypto')

router.post('/auth', (req, res, next) => {

    if (req.session.isLogged) return next(new Error('Client already logged'))

    const username = req.body.username;
    const password = req.body.password;

    if (username == null && password == null) return res.send({returnState: 1, msg: 'Mot de passe ou nom d\'utilisateur incorrect.'})


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

router.post('/isLogged', (req, res) => {

    res.send({returnState: 0, isLogged: (req.session.isLogged) ? true : false})


})

router.post('/username', (req, res) => {

    if (!req.session.isLogged) return next(new Error('Client must be logged'))
    res.send({returnState: 0, username: req.session.user.login})

})

router.post('/logout', (req, res) => {

    req.session.destroy()

    res.send({returnState: 0, redirect: 'login'}) //TODO check redirect

})

module.exports = router;