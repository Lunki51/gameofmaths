const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const SoldierDAO = function () {
    /**
     * Format a soldier if the input soldier is valid.
     *
     * @param object soldier to format
     * @returns the formatted soldier, null if the input soldier can't be formatted
     */
    this.format = function (object) {
        const soldier = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['soldierAttack', 'soldierStudent', 'soldierScore']
        }], object);
        if (!soldier) return null;

        return soldier;
    };

    /**
     * Insert a soldier if the jsonObject is valid.
     *
     * @param obj soldier to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const soldier = this.format(obj);
            if (!soldier) reject(new Error('Invalid input soldier!'));
            else {
                let request = 'INSERT INTO Soldier (soldierScore, soldierStudent, soldierAttack) VALUES (?, ?, ?)';
                db.run(request, [soldier.soldierScore, soldier.soldierStudent, soldier.soldierAttack], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }

        })
    };

    /**
     * Update a soldier if the jsonObject is valid.
     *
     * @param obj soldier with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const soldier = this.format(obj);
            if (!soldier) reject(new Error('Invalid input soldier!'));
            else {
                let request = 'UPDATE Soldier SET soldierScore = ? WHERE soldierStudent = ? AND soldierAttack = ?';
                db.run(request, [soldier.soldierScore, soldier.soldierStudent, soldier.soldierAttack], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the soldier with his id.
     *
     * @param studentID student id
     * @param attackID attack id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (studentID, attackID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Soldier WHERE soldierStudent = ? AND soldierAttack = ?';
            db.run(request, [studentID, attackID], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the soldier in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Soldier';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the soldier in an attack.
     *
     * @param attackID attack id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllOfAttack = function (attackID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Soldier WHERE soldierAttack = ?';
            db.all(request, [attackID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the soldier in an student.
     *
     * @param studentID student id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllOfStudent = function (studentID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Soldier WHERE soldierStudent = ?';
            db.all(request, [studentID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the soldier with a specific id.
     *
     * @param studentID student id
     * @param attackID attack id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the soldier with this id if it's found
     */
    this.findByID = function (studentID, attackID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Soldier WHERE soldierStudent = ? AND soldierAttack = ?';
            db.all(request, [studentID, attackID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new SoldierDAO();
module.exports = dao;