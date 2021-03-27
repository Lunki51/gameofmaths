const dbD = require('gameofmath-db').db
const notification_helper = require('notification_helper')
const knight_dao = require('gameofmath-castle').knight_dao
const master_dao = require('gameofmath-castle').master_dao

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

                // Get old master
                master_dao.findCurrentForCastle(castleID, t)
                    .then(oldMaster => {

                        // Get old knight
                        knight_dao.findCurrentOfMaster(oldMaster.masterID, t)
                            .then(oldKnights => {

                                // Insert the master
                                master_dao.insert({
                                    masterID: -1,
                                    masterStart: currentDate,
                                    masterTaxe: 0.5,
                                    masterCastle: castleID,
                                    masterStudent: studentID
                                }, t)
                                    .then(masterID => {

                                        // Notifie the new master
                                        notification_helper.sendTo(studentID, 'nowMaster', {
                                            oldMasterStudentID: oldKnights ? oldMaster.masterStudent : null,
                                            changeDate: currentDate
                                        }, t)
                                            .then(() => {

                                                if (oldKnights) {
                                                    // Notifie the old master
                                                    notification_helper.sendTo(oldMaster.masterStudent, 'notMaster', {
                                                        newMasterStudentID: studentID,
                                                        changeDate: currentDate
                                                    }, t)
                                                        .then(() => {

                                                            // Update old knight and notifie
                                                            let promises = []
                                                            oldKnights.forEach((item, index) => {
                                                                promises.push(notification_helper.sendTo(studentID, 'notKnightNewMaster', {
                                                                    oldMasterStudentID: oldMaster.masterStudent,
                                                                    newMasterStudentID: studentID,
                                                                    changeDate: currentDate
                                                                }, t))
                                                            })

                                                            Promise.allSettled(promises).then(results => {
                                                                let resError = results.find(e => e.status === 'rejected')
                                                                if (resError) {
                                                                    t.rollback()
                                                                    reject(err)
                                                                } else {
                                                                    t.commit(err => {
                                                                        if (err) reject(err)
                                                                        else resolve(masterID)
                                                                    })
                                                                }
                                                            })

                                                        })
                                                        .catch(err => {
                                                            t.rollback()
                                                            reject(err)
                                                        })
                                                } else {
                                                    t.commit(err => {
                                                        if (err) reject(err)
                                                        else resolve(masterID)
                                                    })
                                                }


                                            })
                                            .catch(err => {
                                                t.rollback()
                                                reject(err)
                                            })

                                    })
                                    .catch(err => {
                                        t.rollback()
                                        reject(err)
                                    })

                            })
                            .catch(err => {
                                t.rollback()
                                reject(err)
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