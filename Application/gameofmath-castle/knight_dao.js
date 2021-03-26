const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const KnightDAO = function () {
    /**
     * Format a knight if the input knight is valid.
     *
     * @param object knight to format
     * @returns the formatted knight, null if the input knight can't be formatted
     */
    this.format = function (object) {
        const knight = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['knightID', 'knightMaster', 'knightStudent']
        }, {t: 'date', ps: ['knightStart', 'knightEnd']}], object);
        if (!knight) return null;

        return knight;
    };

    /**
     * Insert a knight if the jsonObject is valid.
     *
     * @param obj knight to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const knight = this.format(obj);
            if (!knight) reject(new Error('Invalid input knight!'));
            else {
                let request = 'INSERT INTO Knight (knightStart, knightEnd, knightMaster, knightStudent) VALUES (?, ?, ?, ?)';
                db.run(request, [knight.knightStart, knight.knightEnd, knight.knightMaster, knight.knightStudent], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a knight if the jsonObject is valid.
     *
     * @param obj knight with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const knight = this.format(obj);
            if (!knight) reject(new Error('Invalid input knight!'));
            else {
                let request = 'UPDATE Knight SET knightStart = ?, knightEnd = ? , knightMaster = ? , knightStudent = ? WHERE knightID = ?';
                db.run(request, [knight.knightStart, knight.knightEnd, knight.knightMaster, knight.knightStudent, knight.knightID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the knight with his id.
     *
     * @param key knight id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Knight WHERE knightID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the knight in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Knight';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the knight in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Knight WHERE knightID IN (SELECT knightID FROM Knight, Student WHERE knightStudent = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current knight in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrent = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Knight m1 WHERE m1.knightEnd = NULL';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current knight in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrentInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Knight m1 WHERE m1.knightEnd = NULL AND knightID IN (SELECT knightID FROM Knight, Student WHERE knightStudent = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current knight of a master.
     *
     * @param masterID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrentOfMaster = function (masterID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Knight m1 WHERE m1.knightEnd = NULL AND knightMaster = ?';
            db.all(request, [masterID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the knight with a specific id.
     *
     * @param key knight id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the knight with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Knight WHERE knightID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new KnightDAO();
module.exports = dao;