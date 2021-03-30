const express = require('express')
const router = express.Router()

const student_dao = require('gameofmath-db').student_dao
const class_dao = require('gameofmath-db').class_dao
const user_dao = require('gameofmath-db').user_dao
const mpGain_dao = require('gameofmath-db').mpGain_dao
const db = require('gameofmath-db').db
const crypto = require('crypto')
const renderApi = require('gameofmath-mapGeneration')
const fs = require('fs')

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
 * Get a class by ID
 *
 * @param id class id
 * @return
 *  0: classO: the class
 *  1: if the class id is incorrect
 */
router.post('/getClass', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})

    class_dao.findByID(id).then(classO => {
        if (classO == null) res.send({returnState: 1, msg: 'The class id is incorrect'})
        else res.send({returnState: 0, classO: classO})
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
        fs.writeFile('./files/maps/m' + id + '.json', JSON.stringify(renderApi.createMap(200, 200, 10000)), err => {
            if (err) next(err)
            else res.send({returnState: 0, id: id, grade: grade, name: name})
        })
    }).catch(err => next(err))
})

/**
 * Rename a class
 *
 * @param id the id of the class
 * @param newName the new name of the class
 * @return
 *  0: nClass: the class
 *  1: if the the class id is incorrect
 *  2: if the the name is incorrect
 */
router.post('/rename', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const newName = req.body.newName

    if (id == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})
    if (newName == null) return res.send({returnState: 2, msg: 'The name is incorrect'})

    class_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The id is incorrect'})
        else {
            c.name = newName
            class_dao.update(c).then(() => {
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
 *  1: if the the class id is incorrect
 *  2: if the the grade is incorrect
 */
router.post('/setGrade', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const newGrade = req.body.newGrade

    if (id == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})
    if (newGrade == null) return res.send({returnState: 2, msg: 'The grade is incorrect'})

    class_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The id is incorrect'})
        else {
            c.grade = newGrade
            class_dao.update(c).then(() => {
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
 *  1: if the the class id is incorrect
 */
router.post('/regenerateMap', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    if (id == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})

    class_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The class id is incorrect'})
        else {
            const m = JSON.stringify(renderApi.createMap(200, 200, 10000))
            fs.writeFile('./files/maps/m' + id + '.json', m, err => {
                if (err) next(err)
                else res.send({returnState: 0})
            })
        }
    })
})

/**
 * Delete a class.
 *
 * @param id the id of the class
 * @return
 *  0:
 *  1: if the the class id is incorrect
 */
router.post('/delete', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    if (id == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})

    class_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The class id is incorrect'})
        else {

            db.beginTransaction(function (err, t) {

                t.run('DELETE FROM QuizDone WHERE theGain IN (SELECT mpGainID FROM mpGain, Student WHERE theStudent = theUser AND theClass = ?)', [id], function (err) {
                    if (err) {
                        t.rollback()
                        next(err)
                    } else {
                        t.run('DELETE FROM MPGain WHERE theStudent IN (SELECT theUser FROM Student WHERE theClass = ?)', [id], function (err) {
                            if (err) {
                                t.rollback()
                                next(err)
                            } else {
                                console.log(6)
                                student_dao.findAllInClass(id, t).then(rows => {

                                    const ids = rows.map(k => k.theUser).join(',')
                                    t.run('DELETE FROM Student WHERE theUser IN (?)', [ids], function (err) {
                                        if (err) {
                                            t.rollback()
                                            next(err)
                                        } else {
                                            t.run('DELETE FROM User WHERE userID IN (?)', [ids], function (err) {
                                                if (err) {
                                                    t.rollback()
                                                    next(err)
                                                } else {
                                                    t.run('DELETE FROM Class WHERE classID = ?', [id], function (err) {
                                                        if (err) {
                                                            t.rollback()
                                                            next(err)
                                                        } else {
                                                            fs.unlink('./files/maps/m' + id + '.json', err => {
                                                                if (err) {
                                                                    t.rollback()
                                                                    next(err)
                                                                } else {
                                                                    t.commit(err => {
                                                                        if (err) next(err);
                                                                        else res.send({returnState: 0});
                                                                    });
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })

                                        }
                                    })

                                }).catch(err => {
                                    t.rollback()
                                    next(err)
                                })
                            }
                        })
                    }
                })
            })
        }
    }).catch(err => next(err))
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
 *  1: if the class id is incorrect
 */
router.post('/getStudents', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    if (id == null) return res.send({returnState: 1, msg: 'The class id is incorrect'})

    student_dao.findAllUserInClass(id).then(students => {
        students.forEach(o => {
            delete o.password
            delete o.theUser
            delete o.grade
            delete o.classID
            delete o.name
        })
        res.send({returnState: 0, class: id, students: students})
    }).catch(err => next(err))
})

/**
 * Get a student by ID
 *
 * @param id student id
 * @return
 *  0: student: the student
 *  1: if the student id is incorrect
 */
router.post('/getStudent', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})

    student_dao.findUserByID(id).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {
            delete student.password
            res.send({returnState: 0, student: student})
        }
    }).catch(err => next(err))
})

/**
 * Allow to change the lastname of a student
 *
 * @param userId id of the student
 * @param newName new lastname of the student
 * @return
 *  0: student: the student
 *  1: if the the student id is incorrect
 *  2: if the the new name is incorrect
 */
router.post('/setLastname', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const userId = req.body.userId
    const newName = req.body.newName
    if (userId == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})
    if (newName == null) return res.send({returnState: 2, msg: 'The student new name is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {

            student.lastname = newName
            user_dao.update(student).then(() => {
                delete student.password
                res.send({returnState: 0, student: student})
            }).catch(err => next(err))

        }
    }).catch(err => next(err))

})

/**
 * Allow to change the firstname of a student
 *
 * @param userId id of the student
 * @param newName new firstname of the student
 * @return
 *  0: student: the student
 *  1: if the the student id is incorrect
 *  2: if the the new name is incorrect
 */
router.post('/setFirstname', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const userId = req.body.userId
    const newName = req.body.newName
    if (userId == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})
    if (newName == null) return res.send({returnState: 2, msg: 'The student new name is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {

            student.firstname = newName
            user_dao.update(student).then(() => {
                delete student.password
                res.send({returnState: 0, student: student})
            }).catch(err => next(err))

        }
    }).catch(err => next(err))

})

/**
 * Allow to change the login of a student
 *
 * @param userId id of the student
 * @param newLogin new login of the student
 * @return
 *  0: student: the student
 *  1: if the the student id is incorrect
 *  2: if the the new login is incorrect
 */
router.post('/setLogin', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const userId = req.body.userId
    const newLogin = req.body.newLogin
    if (userId == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})
    if (newLogin == null) return res.send({returnState: 2, msg: 'The student new login is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {

            student.login = newLogin
            user_dao.update(student).then(() => {
                delete student.password
                res.send({returnState: 0, student: student})
            }).catch(err => next(err))

        }
    }).catch(err => next(err))

})

/**
 * Allow to regenerate the password of a student
 *
 * @param userId id of the student
 * @return
 *  0: password: the new password
 *  1: if the the student id is incorrect
 */
router.post('/regeneratePassword', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const userId = req.body.userId
    if (userId == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})

    student_dao.findUserByID(userId).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {

            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            var newPassword = ''
            for (let i = 0; i < 12; i++) {
                newPassword += characters.charAt(Math.floor(Math.random() * characters.length))
            }
            student.password = crypto.createHash('sha512').update(newPassword, 'utf-8').digest('hex')
            user_dao.update(student).then(() => {
                res.send({returnState: 0, password: newPassword})
            }).catch(err => next(err))
        }
    }).catch(err => next(err))

})

/**
 * Allow to create a new student
 *
 * @param classId id of the class
 * @param login the login
 * @param lastname the lastname
 * @param firstname the firstname
 * @return
 *  0: student: the student, password: the password
 *  1: Some/all input data are incorrect
 *  2: the class id is incorrect
 */
router.post('/createStudent', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const classId = req.body.classId
    const login = req.body.login
    const lastname = req.body.lastname
    const firstname = req.body.firstname
    if (classId == null || login == null || lastname == null || firstname == null) return res.send({
        returnState: 1,
        msg: 'Some/all of the param is/are incorrect'
    })

    class_dao.findByID(classId).then(c => {
        if (c == null) res.send({returnState: 2, msg: 'The class id is incorrect'})
        else {

            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            var newPassword = ''
            for (let i = 0; i < 12; i++) {
                newPassword += characters.charAt(Math.floor(Math.random() * characters.length))
            }

            student_dao.insertUser({
                userID: -1,
                login: login,
                password: crypto.createHash('sha512').update(newPassword, 'utf-8').digest('hex'),
                lastname: lastname,
                firstname: firstname,
                theClass: classId,
                mp: 0
            }).then(id => {
                res.send({
                    returnState: 0, student: {
                        userID: id,
                        login: login,
                        lastname: lastname,
                        firstname: firstname,
                        theClass: classId,
                        mp: 0
                    }, password: newPassword
                })
            }).catch(err => next(err))
        }
    }).catch(err => next(err))
})

/**
 * Allow to delete a new student
 *
 * @param studentId id of the student
 * @return
 *  0:
 *  1: the student od is incorrect
 */
router.post('/deleteStudent', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const studentId = req.body.studentId
    if (studentId == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})

    student_dao.findByID(studentId).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {
            db.beginTransaction(function (err, t) {

                t.run('DELETE FROM QuizDone WHERE theGain IN (SELECT mpGainID FROM mpGain, Student WHERE theStudent = theUser AND theUser = ?)', [studentId], function (err) {
                    if (err) {
                        t.rollback()
                        next(err)
                    } else {
                        t.run('DELETE FROM MPGain WHERE theStudent IN (SELECT theUser FROM Student WHERE theUser = ?)', [studentId], function (err) {
                            if (err) {
                                t.rollback()
                                next(err)
                            } else {
                                t.run('DELETE FROM Student WHERE theUser = ?', [studentId], function (err) {
                                    if (err) {
                                        t.rollback()
                                        next(err)
                                    } else {
                                        t.run('DELETE FROM User WHERE userID = ?', [studentId], function (err) {
                                            if (err) {
                                                t.rollback()
                                                next(err)
                                            } else {
                                                t.commit(err => {
                                                    if (err) reject(err);
                                                    else res.send({returnState: 0});
                                                });
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            })

        }
    }).catch(err => next(err))
})

/**
 * Get the MP of a student.
 *
 * @param studentId id of the student
 * @return
 *  0: mp: the number of MP of the student
 *  1: the student id is incorrect
 */
router.post('/getMP', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isStudent) return next(new Error('Client must be logged on a student account'))

    const studentId = req.body.studentId
    if (studentId == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})

    student_dao.findByID(studentId).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {
            res.send({returnState: 0, mp: student.mp})
        }
    }).catch(err => next(err))
})

/**
 * Get the MP of a student in function of time.
 *
 * @param studentId id of the student
 * @return
 *  0: mp: the gain of the student with his timestamp
 *  1: the student od is incorrect
 */
router.post('/getMPArray', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isStudent) return next(new Error('Client must be logged on a student account'))

    const studentId = req.body.studentId
    if (studentId == null) return res.send({returnState: 1, msg: 'The student id is incorrect'})

    student_dao.findByID(studentId).then(student => {
        if (student == null) res.send({returnState: 1, msg: 'The student id is incorrect'})
        else {

            mpGain_dao.findAllByStudent(studentId).then(gains => {
                res.send({
                    returnState: 0, mp: gains.map(o => {
                        return {
                            gain: o.amount,
                            time: new Date(o.date).getTime()
                        }
                    })
                })
            }).catch(err => next(err))

        }
    }).catch(err => next(err))

})

module.exports = router;