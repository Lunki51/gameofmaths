const dbD = require('gameofmath-db').db
const mpGain_dao = require('gameofmath-db').mpGain_dao
const quizDone_dao = require('gameofmath-db').quizDone_dao
const notification_helper = require('./notification_helper')
const knight_dao = require('gameofmath-castle').knight_dao
const master_dao = require('gameofmath-castle').master_dao
const knightRequest_dao = require('gameofmath-castle').knightRequest_dao
const dailyQuiz_dao = require('gameofmath-castle').dailyQuiz_dao
const quiz_helper = require('./gameofmath-helper')

const CastleHelper = function () {

    /**
     * Set a new master to a castle.
     * Notifie the new master, the old master and the old knight of the change.
     *
     * @param castleID castle id
     * @param studentID new master id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the master id
     */
    this.setNewMaster = function (castleID, studentID, db = dbD) {
        return new Promise((resolve, reject) => {

            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Insert new master
                master_dao.insert({
                    masterID: -1,
                    masterStart: currentDate,
                    masterTaxe: 0.5,
                    masterCastle: castleID,
                    masterStudent: studentID
                }, t)
                    .then(masterID => {
                        // Get old master
                        return master_dao.findCurrentForCastle(castleID, t)
                            .then(oldMaster => {

                                // If there is an old master
                                if (oldMaster) {
                                    // Notifie the old master
                                    return notification_helper.sendTo(oldMaster.masterStudent, 'notMaster', {
                                        newMasterStudentID: studentID,
                                        castleID: castleID,
                                        date: currentDate
                                    }, t)
                                        // Get old knight
                                        .then(_ => knight_dao.findCurrentOfMaster(oldMaster.masterID, t))
                                        // Notifie old knight and update
                                        .then(oldKnights => {
                                            // Notifie
                                            return Promise.allSettled(oldKnights.map(knight => {
                                                knight.knightEnd = currentDate

                                                return notification_helper.sendTo(knight.knightStudent, 'notKnightNewMaster', {
                                                    oldMasterStudentID: oldMaster.masterStudent,
                                                    newMasterStudentID: studentID,
                                                    castleID: castleID,
                                                    date: currentDate
                                                }, t)
                                                    // Update
                                                    .then(_ => knight.update(knight, t))
                                            }))
                                        })
                                        // Check that all knight have been notifie and updated
                                        .then(results => {
                                            let resError = results.find(e => e.status === 'rejected')
                                            if (resError) throw resError
                                        })
                                        // Get the knight request of the old master
                                        .then(_ => knightRequest_dao.findAllCurrentForMaster(oldMaster, t))
                                        // Reject and notifie
                                        .then(oldRequests => {

                                            // Notifie
                                            return Promise.allSettled(oldRequests.map(oldRequest => {
                                                oldRequest.knightRequestResult = -1

                                                return notification_helper.sendTo(oldRequest.knightRequestStudent, 'knightRequestRefusedNewMaster', {
                                                    oldMasterStudentID: oldMaster.masterStudent,
                                                    newMasterStudentID: studentID,
                                                    castleID: castleID,
                                                    date: currentDate,
                                                    knightRequestID: oldRequest.knightRequestID
                                                }, t)
                                                    // Update
                                                    .then(_ => knightRequest_dao.update(oldRequest, t))
                                            }))
                                        })
                                        // Check that all knightRequest have been notifie and updated
                                        .then(results => {
                                            let resError = results.find(e => e.status === 'rejected')
                                            if (resError) throw resError
                                        })
                                }

                            })
                            // Notifie new master
                            .then(_ => {
                                return notification_helper.sendTo(studentID, 'nowMaster', {
                                    castleID: castleID,
                                    date: currentDate
                                }, t)
                            })
                            //Commit
                            .then(_ => {
                                return t.commit(err => {
                                    if (err) throw err
                                    else resolve(masterID)
                                })
                            })
                    })
                    // Catch
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })
            })
        })
    }

    /**
     * Send a request to be a knight to a master.
     *
     * @param masterID master id
     * @param studentID studentID id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the knightRequest ID
     */
    this.requestToBeKnight = function (masterID, studentID, db = dbD) {
        return new Promise((resolve, reject) => {

            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Insert the request
                knightRequest_dao.insert({
                    knightRequestID: -1,
                    knightRequestDate: currentDate,
                    knightRequestResult: 0,
                    knightRequestMaster: masterID,
                    knightRequestStudent: studentID
                }, t)
                    .then(requestID => {

                        // Notifie the master
                        return notification_helper.sendTo(masterID, 'knightRequestReceive', {
                            studentID: studentID,
                            date: currentDate
                        }, t)
                            .then(_ => {
                                t.commit(err => {
                                    if (err) throw err
                                    else resolve(requestID)
                                })
                            })

                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * Accept a knight request
     *
     * @param knightRequestID knight request id
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.acceptKnight = function (knightRequestID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Get the knight request
                knightRequest_dao.findByID(knightRequestID, t)
                    .then(request => {

                        // Check if he was already a knight
                        return knight_dao.findCurrentOfStudent(request.knightRequestStudent, t)
                            // If there is an old knight, update and notifie old master
                            .then(oldKnight => {
                                if (oldKnight) {
                                    // Update
                                    oldKnight.knightEnd = currentDate
                                    return knight_dao.update(oldKnight, t)
                                        // Notifie old master
                                        .then(_ => notification_helper.sendTo(oldKnight.knightMaster, 'knightLeaveForOther', {
                                            knightStudentID: request.knightRequestStudent,
                                            newMasterID: request.knightRequestMaster,
                                            date: currentDate
                                        }, t))
                                }
                            })
                            // Insert the knight
                            .then(_ => knight_dao.insert({
                                knightID: -1,
                                knightStart: currentDate,
                                knightEnd: null,
                                knightMaster: request.knightRequestMaster,
                                knightStudent: request.knightRequestStudent
                            }, t))
                            // Notifie new knight
                            .then(_ => notification_helper.sendTo(request.knightRequestStudent, 'knightRequestAccepted', {
                                newMaster: request.knightRequestMaster,
                                knightRequestID: request.knightRequestID,
                                date: currentDate
                            }, t))
                            // Update knightRequest
                            .then(_ => {
                                request.knightRequestResult = 1
                                return knightRequest_dao.update(request, t)
                            })
                            // Look for other knight request from the same student
                            .then(_ => knightRequest_dao.findAllCurrentForStudent(request.knightRequestStudent, t))
                            // Refuse them and notifie the various master
                            .then(othersRequests => {
                                return Promise.allSettled(othersRequests.map(item => {
                                    item.knightRequestResult = -1
                                    // Update
                                    return knightRequest_dao.update(item, t)
                                        // Notifie master
                                        .then(_ => notification_helper.sendTo(item.knightRequestMaster, 'knightRequestTooLate', {
                                            newMaster: request.knightRequestMaster,
                                            knightRequestID: knightRequestID,
                                            date: currentDate
                                        }, t))
                                }))
                            })
                            // Check that all the other request have be settled
                            .then(results => {
                                let resError = results.find(e => e.status === 'rejected')
                                if (resError) throw resError
                            })

                    })
                    .then(_ => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve()
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * Refuse a knight request.
     *
     * @param knightRequestID knight request id
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.refuseKnight = function (knightRequestID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Get the knight request
                knightRequest_dao.findByID(knightRequestID, t)
                    .then(request => {

                        request.knightRequestResult = -1
                        // Update the request
                        return knightRequest_dao.update(request, t)
                            // Notifie
                            .then(_ => notification_helper.sendTo(request.knightRequestStudent, 'knightRequestRefused', {
                                masterID: request.knightRequestMaster,
                                knightRequestID: knightRequestID,
                                date: currentDate
                            }, t))

                    })
                    .then(_ => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve()
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * Remove a knight from a castle.
     *
     * @param knightID knight id
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.refuseKnight = function (knightID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                //Get the knight
                knight_dao.findByID(knightID, t)
                    .then(knight => {

                        //Update the knight
                        knight.knightEnd = currentDate
                        return knight_dao.update(knight, t)
                            // Notifie
                            .then(_ => notification_helper.sendTo(knight.knightStudent, 'knightRemove', {
                                masterID: knight.knightMaster,
                                date: currentDate
                            }, t))

                    })
                    .then(_ => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve()
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * Make a knight quit is master.
     *
     * @param knightID knight id
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.quitKnight = function (knightID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                //Get the knight
                knight_dao.findByID(knightID, t)
                    .then(knight => {

                        //Update the knight
                        knight.knightEnd = currentDate
                        return knight_dao.update(knight, t)
                            // Notifie
                            .then(_ => notification_helper.sendTo(knight.knightStudent, 'knightQuit', {
                                knightID: knightID,
                                date: currentDate
                            }, t))

                    })
                    .then(_ => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve()
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * Make the daily quiz of the day.
     *
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the dailyQuizID
     */
    this.makeDailyQuiz = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Make random quiz
                quiz_helper.makeRandomQuiz(5, null, t)
                    // Add the quiz to the DailyQuiz
                    .then(quizID => dailyQuiz_dao.insert({
                        dailyQuizID: -1,
                        dailyQuizDate: currentDate,
                        dailyQuizQuiz: quizID
                    }, t))
                    .then(dailyQuizID => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve(dailyQuizID)
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * return the quizID of the dailyQuiz of the day.
     *
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the QuizID
     */
    this.getDailyQuiz = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            // Get today dailyQuiz
            dailyQuiz_dao.findAllByDate(new Date(), db)
                .then(dailyQuizzes => {
                    if (dailyQuizzes.length > 0) resolve(dailyQuizzes[0])
                    else return this.makeDailyQuiz()
                        .then(id => resolve(id))
                })
                .catch(err => {
                    reject(err)
                })

        })
    }

    /**
     * Mark quiz as done and distribute the MP.
     *
     * @param masterID id of the master
     * @param score score of the master on the quiz
     * @param dailyQuizID id of the daily quiz
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.dailyQuizDone = function (masterID, score, dailyQuizID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Get daily quiz
                dailyQuiz_dao.findByID(dailyQuizID)
                    .then(dailyQuiz => {

                        // Get master
                        return master_dao.findByID(masterID, t)
                            .then(master => {

                                // Get knight
                                return knight_dao.findCurrentOfMaster(masterID, t)
                                    .then(knights => {
                                        let pointByKnights = score * 10 * (1 - master.masterTaxe) / knights.length
                                        let masterPoint = score * 10 - knights.length * pointByKnights

                                        // Insert QuizDone and master MPGain
                                        return quizDone_dao.insertMPGain({
                                            mpGainID: -1,
                                            amount: masterPoint,
                                            type: 'DAILYQUIZ',
                                            date: currentDate,
                                            theStudent: master.masterStudent,
                                            theQuiz: dailyQuiz.dailyQuizQuiz,
                                            score: score
                                        }, t)
                                            // Insert Knights MPGain
                                            .then(_ => Promise.allSettled(knights.map(item => {
                                                return mpGain_dao.insert({
                                                    mpGainID: -1,
                                                    amount: pointByKnights,
                                                    type: 'DAILYQUIZ',
                                                    date: currentDate,
                                                    theStudent: item.knightStudent
                                                }, t)
                                            })))
                                            // Check
                                            .then(results => {
                                                let resError = results.find(e => e.status === 'rejected')
                                                if (resError) throw resError
                                            })
                                    })

                            })

                    })
                    .then(dailyQuizID => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve(dailyQuizID)
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * Change the taxe of the master
     *
     * @param masterID id of the master
     * @param taxe new taxe
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.setMasterTaxe = function (masterID, taxe, db = dbD) {
        return new Promise((resolve, reject) => {

            db.beginTransaction(function (err, t) {

                // Get master
                master_dao.findByID(masterID, t)
                    .then(master => {

                        master.masterTaxe = taxe
                        return master_dao.update(master, t)

                    })
                    .then(dailyQuizID => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve(dailyQuizID)
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })

            })

        })
    }

    /**
     * Get the current master associated with the student.
     *
     * @param studentID id of the student
     * @param db db instance to use
     * @returns {Promise} A promise with the master: the master or null
     */
    this.getStudentMaster = function (studentID, taxe, db = dbD) {
        return new Promise((resolve, reject) => {

            master_dao.findCurrent(db)
                .then(masters => {

                    return resolve(masters.find(e => e.masterStudent === studentID))

                })
                .catch(err => {
                    reject(err)
                })

        })
    }

    /**
     * Get the current knight associated with the student.
     *
     * @param studentID id of the student
     * @param db db instance to use
     * @returns {Promise} A promise with the knight: the knight or null
     */
    this.getStudentKnight = function (studentID, taxe, db = dbD) {
        return new Promise((resolve, reject) => {

            knight_dao.findCurrent(db)
                .then(knights => {

                    return resolve(knights.find(e => e.knightStudent === studentID))

                })
                .catch(err => {
                    reject(err)
                })

        })
    }
}

var helper = new CastleHelper()
module.exports = helper