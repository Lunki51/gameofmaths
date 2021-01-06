const express = require('express')
const router = express.Router()

const student_dao = require('gameofmath-db').student_dao
const class_dao = require('gameofmath-db').class_dao
const user_dao = require('gameofmath-db').user_dao

// ##########################################################################################
// #################################### CLASS MANAGEMENT ####################################
// ##########################################################################################

/**
 * Get the list of the class
 *
 * @return
 *  0: classes: an array with the classes inside
 */
router.post('/getClasses', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    class_dao.findAll().then(classes => {
        res.send({returnState: 0, classes: classes})
    }).catch(err => next(err))
})

/**
 * Create a class
 *
 * @param grade the grade of the class
 * @param name the name of the class
 * @return
 *  0: id: id of the new class, grade: the grade of the class, name: the name of the class
 *  1: if the grade or the name is incorrect
 */
router.post('/create', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const grade = req.body.grade
    const name = req.body.name

    if (grade == null || name == null) return res.send({returnState: 1, msg: 'The grade or name is incorrect'})

    class_dao.insert({
        classID: -1,
        grade: grade,
        name: name
    }).then(id => {
        res.send({returnState: 0, id: id, grade: grade, name: name})
    }).catch(err => next(err))
})

/**
 * Rename a class
 *
 * @param id the id of the class
 * @param newName the new name of the class
 * @return
 *  0: nClass: the class
 *  1: if the the id is incorrect
 *  2: if the the name is incorrect
 */
router.post('/rename', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const newName = req.body.newName

    if (id == null) return res.send({returnState: 1, msg: 'The id is incorrect'})
    if (grade == null) return res.send({returnState: 2, msg: 'The name is incorrect'})

    class_dao.findByID(id) .then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The id is incorrect'})
        else {
            c.name = newName
            class_dao.update(newName).then( () => {
                res.send({returnState: 0, nClass: c})
            }).catch(err => next(err))
        }
    }).catch(err => next(err))
})

/**
 * Change the grade of a class
 *
 * @param id the id of the class
 * @param newGrade the new grade of the class
 * @return
 *  0: nClass: the class
 *  1: if the the id is incorrect
 *  2: if the the grade is incorrect
 */
router.post('/setGrade', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.name
    const newGrade = req.body.newGrade

    if (id == null) return res.send({returnState: 1, msg: 'The id is incorrect'})
    if (grade == null) return res.send({returnState: 2, msg: 'The grade is incorrect'})

    class_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The id is incorrect'})
        else {
            c.grade = newGrade
            class_dao.update(newGrade).then(() => {
                res.send({returnState: 0, nClass: c})
            }).catch(err => next(err))
        }
    }).catch(err => next(err))
})

/**
 * Regenerate the map of a class
 *
 * @param id the id of the class
 * @return
 *  0:
 *  1: if the the id is incorrect
 */
router.post('/regenerateMap', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.name
    if (id == null) return res.send({returnState: 1, msg: 'The id is incorrect'})

    res.send({returnState: 0}) //TODO
})

// ##########################################################################################
// ################################### STUDENT MANAGEMENT ###################################
// ##########################################################################################

/**
 * Get the list of the student in the class
 *
 * @param id id of the class
 * @return
 *  0: class: the id of the class, students: an array with the student inside
 *  1: if the the id is incorrect
 */
router.post('/getStudents', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.name
    if (id == null) return res.send({returnState: 1, msg: 'The id is incorrect'})

    student_dao.findAllUserInClass(id).then(students => {
        students.forEach(o => {
            delete o.password
            delete o.theUser
        })
        res.send({returnState: 0, id: id, students: students})
    }).catch(err => next(err))
})

/**
 * Allow to change the lastname of a student
 *
 * @param classId id of the class
 * @param userId id of the student
 * @param newName new lastname of the student
 * @return
 *  0: student: the student
 *  1: if the the class id is incorrect
 *  2: if the the student id is incorrect
 *  3: if the the student is not in the class
 *  4: if the the new name is incorrect
 */
router.post('/setLastname', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const classId = req.body.classId
    const userId = req.body.userId
    const newName = req.body.newName
    if (classId == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})
    if (userId == null) return res.send({returnState: 2, msg: 'The student id is incorrect'})
    if (newName == null) return res.send({returnState: 4, msg: 'The student new name is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 2, msg: 'The student id is incorrect'})
        else if(student.theClass !== classId) res.send({returnState: 3, msg: 'The student is not in the class'})
        else {

            student.lastname = newName
            user_dao.update(student).then(() => {
                res.send({returnState: 0, student: student})
            }).catch(err => next(err))

        }
    }).catch(err => next(err))

})

/**
 * Allow to change the firstname of a student
 *
 * @param classId id of the class
 * @param userId id of the student
 * @param newName new firstname of the student
 * @return
 *  0: student: the student
 *  1: if the the class id is incorrect
 *  2: if the the student id is incorrect
 *  3: if the the student is not in the class
 *  4: if the the new name is incorrect
 */
router.post('/setFirstname', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const classId = req.body.classId
    const userId = req.body.userId
    const newName = req.body.newName
    if (classId == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})
    if (userId == null) return res.send({returnState: 2, msg: 'The student id is incorrect'})
    if (newName == null) return res.send({returnState: 4, msg: 'The student new name is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 2, msg: 'The student id is incorrect'})
        else if(student.theClass !== classId) res.send({returnState: 3, msg: 'The student is not in the class'})
        else {

            student.firstname = newName
            user_dao.update(student).then(() => {
                res.send({returnState: 0, student: student})
            }).catch(err => next(err))

        }
    }).catch(err => next(err))

})

/**
 * Allow to change the login of a student
 *
 * @param classId id of the class
 * @param userId id of the student
 * @param newLogin new login of the student
 * @return
 *  0: student: the student
 *  1: if the the class id is incorrect
 *  2: if the the student id is incorrect
 *  3: if the the student is not in the class
 *  4: if the the new login is incorrect
 */
router.post('/setLogin', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const classId = req.body.classId
    const userId = req.body.userId
    const newLogin = req.body.newLogin
    if (classId == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})
    if (userId == null) return res.send({returnState: 2, msg: 'The student id is incorrect'})
    if (newLogin == null) return res.send({returnState: 4, msg: 'The student new login is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 2, msg: 'The student id is incorrect'})
        else if(student.theClass !== classId) res.send({returnState: 3, msg: 'The student is not in the class'})
        else {

            student.login = newLogin
            user_dao.update(student).then(() => {
                res.send({returnState: 0, student: student})
            }).catch(err => next(err))

        }
    }).catch(err => next(err))

})


/**
 * Allow to regenerate the password of a student
 *
 * @param classId id of the class
 * @param userId id of the student
 * @return
 *  0: password: the new password
 *  1: if the the class id is incorrect
 *  2: if the the student id is incorrect
 *  3: if the the student is not in the class
 */
router.post('/regeneratePassword', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const classId = req.body.classId
    const userId = req.body.userId
    if (classId == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})
    if (userId == null) return res.send({returnState: 2, msg: 'The student id is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 2, msg: 'The student id is incorrect'})
        else if(student.theClass !== classId) res.send({returnState: 3, msg: 'The student is not in the class'})
        else {

            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            var newPassword = ''
            for (let i = 0; i < 12; i++) {
                newPassword += characters.charAt(Math.floor(Math.random()*characters.length))
            }
            student.password = crypto.createHash('sha512').update(newPassword, 'utf-8').digest('hex')
            user_dao.update(student).then(() => {
                res.send({returnState: 0, password: newPassword})
            }).catch(err => next(err))
        }
    }).catch(err => next(err))

})

module.exports = router;