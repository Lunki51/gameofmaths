const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const KnightRequestDAO = function () {
    /**
     * Format a knightRequest if the input knightRequest is valid.
     *
     * @param object knightRequest to format
     * @returns the formatted knightRequest, null if the input knightRequest can't be formatted
     */
    this.format = function (object) {
        const knightRequest = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['knightRequestID', 'knightRequestResult', 'knightRequestMaster', 'knightRequestStudent']
        }, {t: 'date', ps: ['knightRequestDate']}], object);
        if (!knightRequest) return null;

        return knightRequest;
    };

    /**
     * Insert a knightRequest if the jsonObject is valid.
     *
     * @param obj knightRequest to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const knightRequest = this.format(obj);
            if (!knightRequest) reject(new Error('Invalid input knightRequest!'));
            else {
                let request = 'INSERT INTO KnightRequest (knightRequestDate, knightRequestResult, knightRequestMaster, knightRequestStudent) VALUES (?, ?, ?, ?)';
                db.run(request, [knightRequest.knightRequestDate, knightRequest.knightRequestResult, knightRequest.knightRequestMaster, knightRequest.knightRequestStudent], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a knightRequest if the jsonObject is valid.
     *
     * @param obj knightRequest with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const knightRequest = this.format(obj);
            if (!knightRequest) reject(new Error('Invalid input knightRequest!'));
            else {
                let request = 'UPDATE KnightRequest SET knightRequestDate = ?, knightRequestResult = ? , knightRequestMaster = ? , knightRequestStudent = ? WHERE knightRequestID = ?';
                db.run(request, [knightRequest.knightRequestDate, knightRequest.knightRequestResult, knightRequest.knightRequestMaster, knightRequest.knightRequestStudent, knightRequest.knightRequestID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the knightRequest with his id.
     *
     * @param key knightRequest id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM KnightRequest WHERE knightRequestID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the knightRequest in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM KnightRequest';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the knightRequest in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM KnightRequest WHERE knightRequestID IN (SELECT knightRequestID FROM KnightRequest, Student WHERE knightRequestStudent = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current knightRequest in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrent = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM KnightRequest m1 WHERE knightRequestResult = 0';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current knightRequest in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllCurrentInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM KnightRequest WHERE knightRequestResult = 0 AND knightRequestID IN (SELECT knightRequestID FROM KnightRequest, Student WHERE knightRequestStudent = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the knightRequest of a student.
     *
     * @param studentID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllForStudent = function (studentID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM KnightRequest WHERE knightRequestStudent = ?';
            db.all(request, [studentID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current knightRequest of a student.
     *
     * @param studentID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllCurrentForStudent = function (studentID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM KnightRequest WHERE knightRequestResult = 0 AND knightRequestStudent = ?';
            db.all(request, [studentID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the knightRequest with a specific id.
     *
     * @param key knightRequest id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the knightRequest with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM KnightRequest WHERE knightRequestID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new KnightRequestDAO();
module.exports = dao;