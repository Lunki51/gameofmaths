const dbD = require('gameofmath-db').db
const notification_helper = require('notification_helper')
const knight_dao = require('gameofmath-castle').knight_dao
const master_dao = require('gameofmath-castle').master_dao
const knightRequest_dao = require('gameofmath-castle').knightRequest_dao

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
                                        .then(_ => knightRequest_dao.findAllForMaster(oldMaster, t))
                                        // Reject and notifie
                                        .then(oldRequests => {

                                            // Notifie
                                            return Promise.allSettled(oldRequests.map(oldRequest => {
                                                oldRequest.knightRequestResult = -1

                                                return notification_helper.sendTo(oldRequest.knightRequestStudent, 'knightRequestRefuseNewMaster', {
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
                        notification_helper.sendTo(masterID, 'knightRequestReceive', {
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
}

var helper = new CastleHelper()
module.exports = helper