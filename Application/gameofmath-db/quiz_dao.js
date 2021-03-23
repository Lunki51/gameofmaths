const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const QuizDAO = function () {
    /**
     * Format a quiz if the input quiz is valid.
     *
     * @param object quiz to format
     * @returns the formatted quiz, null if the input quiz can't be formatted
     */
    this.format = function (object) {
        const quiz = object_helper.formatPropertiesWithType([
            {t: 'number', ps: ['quizID', 'theChapter']},
            {t: 'boolean', ps: ['asAnOrder']},
            {t: 'string', ps: ['quizName']}
            ], object);
        if (!quiz) return null;

        return quiz;
    };

    /**
     * Insert a quiz if the jsonObject is valid.
     *
     * @param obj quiz to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const quiz = this.format(obj);
            if (!quiz) reject(new Error('Invalid input quiz!'));
            else {
                let request = 'INSERT INTO Quiz (theChapter, asAnOrder, quizName) VALUES (?, ?, ?)';
                db.run(request, [quiz.theChapter, quiz.asAnOrder, quiz.quizName], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a quiz if the jsonObject is valid.
     *
     * @param obj quiz with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const quiz = this.format(obj);
            if (!quiz) reject(new Error('Invalid input quiz!'));
            else {
                let request = 'UPDATE Quiz SET theChapter = ?, asAnOrder = ?, quizName = ? WHERE quizID = ?';
                db.run(request, [quiz.theChapter, quiz.asAnOrder, quiz.quizName, quiz.quizID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the quiz with his id.
     *
     * @param key quiz id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Quiz WHERE quizID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the quiz in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Quiz';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the quiz in the chapter.
     *
     * @param theChapter chapter
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInChapter = function (theChapter, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Quiz WHERE theChapter = ?';
            db.all(request, [theChapter], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the quiz with a specific id.
     *
     * @param key quiz id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the quiz with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Quiz WHERE quizID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the quiz with a specific name.
     *
     * @param name quiz name
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the quiz with this id if it's found
     */
    this.findByName = function (name, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Quiz WHERE quizName = ?';
            db.all(request, [name], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new QuizDAO();
module.exports = dao;