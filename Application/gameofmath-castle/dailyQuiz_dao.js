const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const DailyQuizDAO = function () {
    /**
     * Format a dailyQuiz if the input dailyQuiz is valid.
     *
     * @param object dailyQuiz to format
     * @returns the formatted dailyQuiz, null if the input dailyQuiz can't be formatted
     */
    this.format = function (object) {
        const dailyQuiz = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['dailyQuizID', 'dailyQuizQuiz']
        }, {t: 'date', ps: ['dailyQuizDate']}], object);
        if (!dailyQuiz) return null;

        return dailyQuiz;
    };

    /**
     * Insert a dailyQuiz if the jsonObject is valid.
     *
     * @param obj dailyQuiz to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const dailyQuiz = this.format(obj);
            if (!dailyQuiz) reject(new Error('Invalid input dailyQuiz!'));
            else {
                let request = 'INSERT INTO DailyQuiz (dailyQuizDate, dailyQuizQuiz) VALUES (?, ?)';
                db.run(request, [dailyQuiz.dailyQuizDate, dailyQuiz.dailyQuizQuiz], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a dailyQuiz if the jsonObject is valid.
     *
     * @param obj dailyQuiz with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const dailyQuiz = this.format(obj);
            if (!dailyQuiz) reject(new Error('Invalid input dailyQuiz!'));
            else {
                let request = 'UPDATE DailyQuiz SET dailyQuizDate = ?, dailyQuizQuiz = ? WHERE dailyQuizID = ?';
                db.run(request, [dailyQuiz.dailyQuizDate, dailyQuiz.dailyQuizQuiz, dailyQuiz.dailyQuizID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the dailyQuiz with his id.
     *
     * @param key dailyQuiz id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM DailyQuiz WHERE dailyQuizID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the dailyQuiz in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM DailyQuiz';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the dailyQuiz with a specific id.
     *
     * @param key dailyQuiz id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the dailyQuiz with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM DailyQuiz WHERE dailyQuizID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the dailyQuiz with of a specific day.
     *
     * @param date date
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the dailyQuiz with this id if it's found
     */
    this.findAllByDate = function (date, db = dbD) {
        return new Promise((resolve, reject) => {
            var start = new Date(date);
            start.setHours(0,0,0,0);

            var end = new Date(date);
            end.setHours(23,59,59,999);

            let request = 'SELECT * FROM DailyQuiz WHERE dailyQuizDate BETWEEN ? AND ? ORDER BY dailyQuizDate DESC';
            db.all(request, [start, end], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };
}

var dao = new DailyQuizDAO();
module.exports = dao;