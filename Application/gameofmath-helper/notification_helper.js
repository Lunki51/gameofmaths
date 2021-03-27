const dbD = require('gameofmath-db').db
const notification_dao = require('gameofmath-castle').notification_dao
const student_dao = require('gameofmath-db').student_dao
const teacher_dao = require('gameofmath-db').teacher_dao
const user_dao = require('gameofmath-db').user_dao

const NotificationHelper = function () {

   /**
     * Send a notification to a user.
     *
     * @param userID destination
     * @param type notification type
     * @param data dataToSend
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the notification id
     */
    this.sendTo = function (userID, type, data, db = dbD) {
        return new Promise((resolve, reject) => {

            notification_dao.insert({
                notifID: -1,
                notifType: type,
                notifData: data,
                notifDate: new Date(),
                notifUser: userID
            }, db)
                .then(id => resolve(id))
                .catch(err => reject(err))

        })
    }

   /**
     * Send a notification to every student of a class.
     *
     * @param classID destination
     * @param type notification type
     * @param data dataToSend
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.broadcastToClass = function (classID, type, data, db = dbD) {
        return new Promise((resolve, reject) => {

            db.beginTransaction(function (err, t) {

                student_dao.findAllInClass(classID, t)
                    .then(students => {

                        let promises = []
                        students.forEach((item, index) => {
                            promises.push(notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: item.theUser
                            }, db))
                        })

                        Promise.allSettled(promises).then(results => {
                            let resError = results.find(e => e.status === 'rejected')
                            if (resError) {
                                t.rollback()
                                reject(err)
                            } else {
                                t.commit(err => {
                                    if (err) reject(err)
                                    else resolve(id)
                                })
                            }
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
     * Send a notification to every student.
     *
     * @param type notification type
     * @param data dataToSend
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.broadcastToEveryStudent = function (type, data, db = dbD) {
        return new Promise((resolve, reject) => {

            db.beginTransaction(function (err, t) {

                student_dao.findAll(t)
                    .then(students => {

                        let promises = []
                        students.forEach((item, index) => {
                            promises.push(notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: item.theUser
                            }, db))
                        })

                        Promise.allSettled(promises).then(results => {
                            let resError = results.find(e => e.status === 'rejected')
                            if (resError) {
                                t.rollback()
                                reject(err)
                            } else {
                                t.commit(err => {
                                    if (err) reject(err)
                                    else resolve(id)
                                })
                            }
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
     * Send a notification to every teacher.
     *
     * @param type notification type
     * @param data dataToSend
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.broadcastToEveryTeacher = function (type, data, db = dbD) {
        return new Promise((resolve, reject) => {

            db.beginTransaction(function (err, t) {

                teacher_dao.findAll(t)
                    .then(teachers => {

                        let promises = []
                        teachers.forEach((item, index) => {
                            promises.push(notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: item.theUser
                            }, db))
                        })

                        Promise.allSettled(promises).then(results => {
                            let resError = results.find(e => e.status === 'rejected')
                            if (resError) {
                                t.rollback()
                                reject(err)
                            } else {
                                t.commit(err => {
                                    if (err) reject(err)
                                    else resolve(id)
                                })
                            }
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
     * Send a notification to everyone.
     *
     * @param type notification type
     * @param data dataToSend
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.broadcastToEveryone = function (type, data, db = dbD) {
        return new Promise((resolve, reject) => {

            db.beginTransaction(function (err, t) {

                user_dao.findAll(t)
                    .then(users => {

                        let promises = []
                        users.forEach((item, index) => {
                            promises.push(notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: item.userID
                            }, db))
                        })

                        Promise.allSettled(promises).then(results => {
                            let resError = results.find(e => e.status === 'rejected')
                            if (resError) {
                                t.rollback()
                                reject(err)
                            } else {
                                t.commit(err => {
                                    if (err) reject(err)
                                    else resolve(id)
                                })
                            }
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

var helper = new NotificationHelper()
module.exports = helper