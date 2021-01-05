const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const QuizQuestionDAO = function () {
    /**
     * Format a quizQuestion if the input quizQuestion is valid.
     *
     * @param object quizQuestion to format
     * @returns the formatted quizQuestion, null if the input quizQuestion can't be formatted
     */
    this.format = function (object) {
        const quizQuestion = object_helper.formatPropertiesWithType([
            {t: 'number', ps: ['theQuestion', 'theQuiz', 'qNumber']}
            ], object);
        if (!quizQuestion) return null;

        return quizQuestion;
    };

    /**
     * Insert a quizQuestion if the jsonObject is valid.
     *
     * @param obj quizQuestion to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const quizQuestion = this.format(obj);
            if (!quizQuestion) reject(new Error('Invalid input quizQuestion!'));
            else {
                let request = 'INSERT INTO QuizQuestion (theQuestion, theQuiz, qNumber) VALUES (?, ?, ?)';
                db.run(request, [quizQuestion.theQuestion, quizQuestion.theQuiz, quizQuestion.qNumber], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }

        })
    };

    /**
     * Update a quizQuestion if the jsonObject is valid.
     *
     * @param obj quizQuestion with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const quizQuestion = this.format(obj);
            if (!quizQuestion) reject(new Error('Invalid input quizQuestion!'));
            else {
                let request = 'UPDATE QuizQuestion SET qNumber = ? WHERE theQuestion = ? AND theQuiz = ?';
                db.run(request, [quizQuestion.qNumber, quizQuestion.theQuestion, quizQuestion.theQuiz], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the quizQuestion with his id.
     *
     * @param quiz quiz id
     * @param question gain id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (question, quiz, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM QuizQuestion WHERE theQuestion = ? AND theQuiz = ?';
            db.run(request, [question, quiz], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the quizQuestion in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizQuestion';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the quizQuestion by a student.
     *
     * @param questionID question id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllByQuestion = function (questionID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizQuestion WHERE theQuestion = ?';
            db.all(request, [questionID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the quizQuestion for a specific quiz
     *
     * @param quizID quiz id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllByQuiz = function (quizID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizQuestion WHERE theQuiz = ?';
            db.all(request, [quizID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the quizQuestion with a specific id.
     *
     * @param question question id
     * @param quiz quiz id
     * @param db db instance to u
     * @returns {Promise} A promise that resolve the quizQuestion with this id if it's found
     */
    this.findByID = function (question, quiz, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizQuestion WHERE theQuestion = ? AND theQuiz = ?';
            db.all(request, [question, quiz], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new QuizQuestionDAO();
module.exports = dao;