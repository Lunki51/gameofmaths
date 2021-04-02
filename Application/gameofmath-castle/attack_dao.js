const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const AttackDAO = function () {
    /**
     * Format a attack if the input attack is valid.
     *
     * @param object attack to format
     * @returns the formatted attack, null if the input attack can't be formatted
     */
    this.format = function (object) {
        const attack = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['attackID', 'attackResult', 'attackQuiz', 'attackOrigin', 'attackTarget']
        }, {t: 'date', ps: ['attackStart']}], object);
        if (!attack) return null;

        return attack;
    };

    /**
     * Insert a attack if the jsonObject is valid.
     *
     * @param obj attack to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const attack = this.format(obj);
            if (!attack) reject(new Error('Invalid input attack!'));
            else {
                let request = 'INSERT INTO Attack (attackStart, attackOrigin, attackResult, attackQuiz, attackTarget) VALUES (?, ?, ?, ?, ?)';
                db.run(request, [attack.attackStart, attack.attackOrigin, attack.attackResult, attack.attackQuiz, attack.attackTarget], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a attack if the jsonObject is valid.
     *
     * @param obj attack with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const attack = this.format(obj);
            if (!attack) reject(new Error('Invalid input attack!'));
            else {
                let request = 'UPDATE Attack SET attackStart = ?, attackOrigin = ? , attackResult = ? , attackQuiz = ?, attackTarget = ? WHERE attackID = ?';
                db.run(request, [attack.attackStart, attack.attackOrigin, attack.attackResult, attack.attackQuiz, attack.attackTarget, attack.attackID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the attack with his id.
     *
     * @param key attack id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Attack WHERE attackID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the attack in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Attack';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the attack in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Attack WHERE attackID IN (SELECT attackID FROM Attack, Student WHERE attackOrigin = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current attack in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrent = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Attack m1 WHERE m1.attackResult = 0';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the current attack in a class.
     *
     * @param classID id of the student
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findCurrentInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Attack m1 WHERE m1.attackResult = 0 AND attackID IN (SELECT attackID FROM Attack, Student WHERE attackOrigin = theUser AND theClass = ?)';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the attack with a specific id.
     *
     * @param key attack id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the attack with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Attack WHERE attackID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new AttackDAO();
module.exports = dao;