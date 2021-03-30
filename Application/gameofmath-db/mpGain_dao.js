const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const MPGainDAO = function () {
    /**
     * Format a mpGain if the input mpGain is valid.
     *
     * @param object mpGain to format
     * @returns the formatted mpGain, null if the input mpGain can't be formatted
     */
    this.format = function (object) {
        const mpGain = object_helper.formatPropertiesWithType([{
            t: 'string',
            ps: ['type']
        }, {t: 'number', ps: ['mpGainID', 'amount', 'theStudent']},
            {t: 'date', ps: ['date']}], object);
        if (!mpGain) return null;

        if (['QUIZ', 'DAILYQUIZ', 'BATTLELOST'].indexOf(mpGain.type) >= 0) return mpGain;
        return null;
    };

    /**
     * Insert a mpGain if the jsonObject is valid.
     *
     * @param obj mpGain to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const mpGain = this.format(obj);
            if (!mpGain) reject(new Error('Invalid input mpGain!'));
            else {
                let request = 'INSERT INTO MPGain (amount, type, date, theStudent) VALUES (?, ?, ?, ?)';
                db.run(request, [mpGain.amount, mpGain.type, mpGain.date, mpGain.theStudent], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a mpGain if the jsonObject is valid.
     *
     * @param obj mpGain with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const mpGain = this.format(obj);
            if (!mpGain) reject(new Error('Invalid input mpGain!'));
            else {
                let request = 'UPDATE MPGain SET amount = ?, type = ?, date = ?, theStudent = ? WHERE mpGainID = ?';
                db.run(request, [mpGain.amount, mpGain.type, mpGain.date, mpGain.theStudent, mpGain.mpGainID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the mpGain with his id.
     *
     * @param key mpGain id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM MPGain WHERE mpGainID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the mpGain in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM MPGain';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the mpGain with a specific id.
     *
     * @param key mpGain id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the mpGain with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM MPGain WHERE mpGainID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the mpGain with a specific student.
     *
     * @param login mpGain login
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the mpGain with this login if it's found
     */
    this.findAllByStudent = function (studentID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM MPGain WHERE theStudent = ?';
            db.all(request, [studentID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };
}

var dao = new MPGainDAO();
module.exports = dao;