const express = require('express')
const router = express.Router()

const teacher_dao = require('gameofmath-db').teacher_dao
const db = require('gameofmath-db').db

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

    const newName = req.body.newName.trim();

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

    const newName = req.body.newName.trim();

    if (newName != null && newName.length > 0) {

        req.session.user.firstname = newName
        teacher_dao.update(req.session.user).then(() => {
            res.send({returnState: 0})
        }).catch(err => next(err))

    } else res.send({returnState: 1, msg: 'firstname incorrect.'})

})

/**
 * Allow the teacher to look for something in the DB.
 *
 * @param key the thing to look for
 * @return
 *  0: results: an array of object {type: the type of object, object: the object}
 *  1: the key is incorrect
 */
router.post('/search', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a teacher account'))

    const key = req.body.key.trim().toUpperCase()

    if (key != null && key.length > 0) {

        const reduceToType = function(type, array) {
            return array.reduce((acc, obj) => {
                acc.push({type: type, object: obj})
                return acc
            }, [])
        }

        const search = function (type, table, attributes, jointure = '') {
            return new Promise((resolve, reject) => {
                let request = 'SELECT * FROM '+table+' WHERE '
                if (jointure.length !== 0) request += jointure+' AND ('
                let params = []

                attributes.forEach((item, index) => {
                    if (index !== 0) request += ' OR '
                    request += 'UPPER('+item+') LIKE ?'
                    params.push('%'+key+'%')
                })
                if (jointure.length !== 0) request += ')'

                db.all(request, params, function (err, rows) {
                    if (err) reject(err)
                    else resolve(reduceToType(type, rows))
                })
            })
        }

        let promises = []
        promises.push(search('class','Class', ['grade', 'name']))
        promises.push(search('student','User, Student', ['firstname', 'lastname', 'login'], 'theUser = userID'))
        promises.push(search('chapter','Chapter', ['name']))
        promises.push(search('quiz','Quiz', ['quizName']))
        promises.push(search('question','Question', ['upperText', 'lowerText']))

        Promise.all(promises).then((values) => {
            values = values.reduce((acc, obj) => {
                acc = acc.concat(obj)
                return acc
            }, [])
            values.splice(5)

            res.send({returnState: 0, results: values})
        }).catch(err => next(err))

    } else res.send({returnState: 1, msg: 'the key is incorrect'})

})

module.exports = router;