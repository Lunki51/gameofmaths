const express = require('express')
const router = express.Router()

const db = require('gameofmath-db').db
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

module.exports = router;