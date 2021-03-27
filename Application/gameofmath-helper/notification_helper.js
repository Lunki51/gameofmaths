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

                        let i = 0
                        let good = true
                        while (good && i < students.length) {

                            notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: students[i].theUser
                            }, db)
                                .catch(err => {
                                    good = false
                                    t.rollback()
                                    reject(err)
                                })

                        }

                        if (good) {
                            t.commit(err => {
                                if (err) reject(err)
                                else resolve()
                            })
                        }

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

                        let i = 0
                        let good = true
                        while (good && i < students.length) {

                            notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: students[i].theUser
                            }, db)
                                .catch(err => {
                                    good = false
                                    t.rollback()
                                    reject(err)
                                })

                        }

                        if (good) {
                            t.commit(err => {
                                if (err) reject(err)
                                else resolve()
                            })
                        }

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

                        let i = 0
                        let good = true
                        while (good && i < teachers.length) {

                            notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: teachers[i].theUser
                            }, db)
                                .catch(err => {
                                    good = false
                                    t.rollback()
                                    reject(err)
                                })

                        }

                        if (good) {
                            t.commit(err => {
                                if (err) reject(err)
                                else resolve()
                            })
                        }

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

                        let i = 0
                        let good = true
                        while (good && i < users.length) {

                            notification_dao.insert({
                                notifID: -1,
                                notifType: type,
                                notifData: data,
                                notifDate: new Date(),
                                notifUser: users[i].userID
                            }, db)
                                .catch(err => {
                                    good = false
                                    t.rollback()
                                    reject(err)
                                })

                        }

                        if (good) {
                            t.commit(err => {
                                if (err) reject(err)
                                else resolve()
                            })
                        }

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