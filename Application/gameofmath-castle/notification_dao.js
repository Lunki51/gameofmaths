const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const NotificationDAO = function () {
    /**
     * Format a notification if the input notification is valid.
     *
     * @param object notification to format
     * @returns the formatted notification, null if the input notification can't be formatted
     */
    this.format = function (object) {
        const notification = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['notifID', 'notifStudent']
        }, {t: 'string', ps: ['notifType', 'notifData']},
            {t: 'date', ps: ['notifDate']}], object);
        if (!notification) return null;

        return notification;
    };

    /**
     * Insert a notification if the jsonObject is valid.
     *
     * @param obj notification to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const notification = this.format(obj);
            if (!notification) reject(new Error('Invalid input notification!'));
            else {
                let request = 'INSERT INTO Notification (notifType, notifData, notifDate, notifStudent) VALUES (?, ?, ?, ?)';
                db.run(request, [notification.notifType, notification.notifData, notification.notifDate, notification.notifStudent], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a notification if the jsonObject is valid.
     *
     * @param obj notification with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const notification = this.format(obj);
            if (!notification) reject(new Error('Invalid input notification!'));
            else {
                let request = 'UPDATE Notification SET notifType = ?, notifData = ? , notifDate = ? , notifStudent = ? WHERE notifID = ?';
                db.run(request, [notification.notifType, notification.notifData, notification.notifDate, notification.notifStudent, notification.notifID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the notification with his id.
     *
     * @param key notification id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Notification WHERE notifID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the notification in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Notification';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the notification at destination of a specific student.
     *
     * @param studendID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllForStudent = function (studendID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Notification WHERE notifStudent = ?';
            db.all(request, [studendID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the notification with a specific id.
     *
     * @param key notification id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the notification with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Notification WHERE notifID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new NotificationDAO();
module.exports = dao;