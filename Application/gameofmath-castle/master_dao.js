const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const MasterDAO = function () {
    /**
     * Format a master if the input master is valid.
     *
     * @param object master to format
     * @returns the formatted master, null if the input master can't be formatted
     */
    this.format = function (object) {
        const master = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['masterID', 'masterTaxe', 'masterCastle', 'masterStudent']
        }, {t: 'date', ps: ['masterStart']}], object);
        if (!master) return null;

        return master;
    };

    /**
     * Insert a master if the jsonObject is valid.
     *
     * @param obj master to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const master = this.format(obj);
            if (!master) reject(new Error('Invalid input master!'));
            else {
                let request = 'INSERT INTO Master (masterStart, masterTaxe, masterCastle, masterStudent) VALUES (?, ?, ?, ?)';
                db.run(request, [master.masterStart, master.masterTaxe, master.masterCastle, master.masterStudent], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a master if the jsonObject is valid.
     *
     * @param obj master with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const master = this.format(obj);
            if (!master) reject(new Error('Invalid input master!'));
            else {
                let request = 'UPDATE Master SET masterStart = ?, masterTaxe = ? , masterCastle = ? , masterStudent = ? WHERE masterID = ?';
                db.run(request, [master.masterStart, master.masterTaxe, master.masterCastle, master.masterStudent, master.masterID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the master with his id.
     *
     * @param key master id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Master WHERE masterID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the master in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Master';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the master in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Master WHERE masterID IN (SELECT masterID FROM Master, Student WHERE masterStudent = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current master in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrent = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Master m1 WHERE m1.masterStart = (SELECT MAX(m2.masterStart) FROM Master m2 WHERE m2.masterCastle = m1.masterCastle)';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the current master of a castle.
     *
     * @param castleID castle
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrentForCastle = function (castleID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Master m1 WHERE masterCastle = ? AND masterStart = (SELECT MAX(masterStart) FROM Master WHERE masterCastle = ?)';
            db.all(request, [castleID, castleID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get all the current master in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrentInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Master m1 WHERE m1.masterStart = (SELECT MAX(m2.masterStart) FROM Master m2 WHERE m2.masterCastle = m1.masterCastle) AND masterID IN (SELECT masterID FROM Master, Student WHERE masterStudent = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the master with a specific id.
     *
     * @param key master id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the master with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Master WHERE masterID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new MasterDAO();
module.exports = dao;