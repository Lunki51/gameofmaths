const express = require('express')
const router = express.Router()

const db = require('gameofmath-db').db
const student_dao = require('gameofmath-db').student_dao
const castle_helper = require('gameofmath-helper').castle_helper
const castle_dao = require('gameofmath-castle').castle_dao
const master_dao = require('gameofmath-castle').master_dao
const knight_dao = require('gameofmath-castle').knight_dao

/**
 * Get Info on the castle
 *
 * @param castleID the id of the castle
 * @return
 *  0: castleID, castleName, masterStudentID, knights: [ (ID of each student) ]
 *  1: if the castleID is invalid or not from the same class as the user
 */
router.post('/getCastleInfo', (req, res, next) => {
    if (!req.session.isLogged) return next(new Error('Client must be logged'))

    const castleID = req.body.castleID;
    if (castleID == null) return res.send({returnState: 1, msg: 'CastleID invalid'})

    castle_dao.findByID(castleID)
        .then(castle => {
            if (castle == null) return res.send({returnState: 1, msg: 'CastleID invalid'})
            else if (req.session.isStudent && req.session.user.theClass !== castle.castleClass) return res.send({
                returnState: 1,
                msg: 'CastleID is not in the student class'
            })
            else {

                return master_dao.findCurrentForCastle(castleID)
                    .then(master => {

                        return knight_dao.findCurrentOfMaster(master.masterID)
                            .then(knights => {

                                return res.send({
                                    returnState: 0,
                                    castleID: castleID,
                                    castleName: castle.castleName,
                                    masterStudentID: master.masterStudent,
                                    knights: knights.reduce((acc, obj) => {
                                        acc.push(obj.knightStudent)
                                        return acc
                                    }, [])
                                })

                            })

                    })

            }
        }).catch(err => next(err))
})

/**
 * Get Info on a master
 *
 * @param masterID the id of the master
 * @return
 *  0: masterID, castleID, masterStudentID, knights: [ (ID of each student) ], masterStart, masterTaxe, firstname, lastname, mp
 *  1: if the masterID is invalid or not from the same class as the user
 */
router.post('/getMasterInfo', (req, res, next) => {
    if (!req.session.isLogged) return next(new Error('Client must be logged'))

    const masterID = req.body.masterID;
    if (masterID == null) return res.send({returnState: 1, msg: 'MasterID invalid'})

    master_dao.findByID(masterID)
        .then(master => {
            if (master == null) return res.send({returnState: 1, msg: 'MasterID invalid'})
            else {

                return castle_dao.findByID(master.masterCastle)
                    .then(castle => {
                        if (req.session.isStudent && req.session.user.theClass !== castle.castleClass) return res.send({
                            returnState: 1,
                            msg: 'MasterID is not in the student class'
                        }) else {

                            return knight_dao.findCurrentOfMaster(master.masterID)
                                .then(knights => {

                                    return student_dao.findUserByID(master.masterStudent)
                                        .then(student => {

                                            return res.send({
                                                returnState: 0,
                                                masterID: masterID,
                                                castleID: master.masterCastle,
                                                masterStudentID: master.masterStudent,
                                                knights: knights.reduce((acc, obj) => {
                                                    acc.push(obj.knightStudent)
                                                    return acc
                                                }, []),
                                                masterStart: master.masterStart,
                                                masterTaxe: master.masterTaxe,
                                                firstname: student.firstname,
                                                lastname: student.lastname,
                                                mp: student.mp,
                                            })

                                        })

                                })

                        }
                    })


            }
        }).catch(err => next(err))
})

/**
 * Get Info on a knight
 *
 * @param knightID the id of the knight
 * @return
 *  0: knightID, knightStudentID, masterID, castleID, masterStudentID, knightStart, firstname, lastname, mp
 *  1: if the knightID is invalid or not from the same class as the user
 */
router.post('/getKnightInfo', (req, res, next) => {
    if (!req.session.isLogged) return next(new Error('Client must be logged'))

    const knightID = req.body.masterID;
    if (knightID == null) return res.send({returnState: 1, msg: 'KnightID invalid'})

    knight_dao.findByID(knightID)
        .then(knight => {
            if (knight == null) return res.send({returnState: 1, msg: 'KnightID invalid'})
            else {

                return master_dao.findByID(knight.knightMaster)
                    .then(master => {

                        return castle_dao.findByID(master.masterCastle)
                            .then(castle => {
                                if (req.session.isStudent && req.session.user.theClass !== castle.castleClass) return res.send({
                                    returnState: 1,
                                    msg: 'KnightID is not in the student class'
                                }) else {

                                    return student_dao.findUserByID(knight.knightStudent)
                                        .then(student => {

                                            return res.send({
                                                returnState: 0,
                                                knightID: knightID,
                                                knightStudentID: knight.knightStudent,
                                                masterID: knight.knightMaster,
                                                masterStudentID: master.masterStudent,
                                                knightStart: knight.knightStart,
                                                firstname: student.firstname,
                                                lastname: student.lastname,
                                                mp: student.mp,
                                            })

                                        })

                                }
                            })

                    })

            }
        }).catch(err => next(err))
})

/**
 * Get Info on a student
 *
 * @param studentID the id of the student
 * @return
 *  0: firstname, lastname, mp, isAKnight, isAMaster
 *  1: if the knightID is invalid or not from the same class as the user
 */
router.post('/getStudentInfo', (req, res, next) => {
    if (!req.session.isLogged) return next(new Error('Client must be logged'))

    const studentID = req.body.masterID;
    if (studentID == null) return res.send({returnState: 1, msg: 'StudentID invalid'})

    student_dao.findUserByID(studentID)
        .then(student => {
            if (student == null) return res.send({returnState: 1, msg: 'StudentID invalid'})
            else if (req.session.isStudent && req.session.user.theClass !== castle.castleClass) return res.send({
                returnState: 1,
                msg: 'StudentID is not in the student class'
            }) else {

                return castle_helper.getStudentMaster(studentID)
                    .then(master => {
                        return castle_helper.getStudentKnight(studentID)
                            .then(knight => {

                                res.send({
                                    returnState: 0,
                                    firstname: student.firstname,
                                    lastname: student.lastname,
                                    mp: student.mp,
                                    isAKnight: knight != null,
                                    isAMaster: master != null,
                                })

                            })
                    })

            }
        }).catch(err => next(err))
})

module.exports = router;