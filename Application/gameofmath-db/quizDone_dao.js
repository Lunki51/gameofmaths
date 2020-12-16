const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const QuizDoneDAO = function () {
    /**
     * Format a quizDone if the input quizDone is valid.
     *
     * @param object quizDone to format
     * @returns the formatted quizDone, null if the input quizDone can't be formatted
     */
    this.format = function (object) {
        const quizDone = object_helper.formatPropertiesWithType([
            {t: 'number', ps: ['theQuiz', 'theGain', 'score']}
            ], object);
        if (!quizDone) return null;

        return quizDone;
    };

    /**
     * Insert a quizDone if the jsonObject is valid.
     *
     * @param obj quizDone to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const quizDone = this.format(obj);
            if (!quizDone) reject(new Error('Invalid input quizDone!'));
            else {
                let request = 'INSERT INTO QuizDone (theQuiz, theGain, score) VALUES (?, ?, ?)';
                db.run(request, [quizDone.theQuiz, quizDone.theGain, quizDone.score], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a quizDone if the jsonObject is valid.
     *
     * @param obj quizDone with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const quizDone = this.format(obj);
            if (!quizDone) reject(new Error('Invalid input quizDone!'));
            else {
                let request = 'UPDATE QuizDone SET score = ? WHERE theQuiz = ? AND theGain = ?';
                db.run(request, [quizDone.score, quizDone.theQuiz, quizDone.theGain], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the quizDone with his id.
     *
     * @param quiz quiz id
     * @param gain gain id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (quiz, gain, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM QuizDone WHERE theQuiz = ? AND theGain = ?';
            db.run(request, [quiz, gain], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the quizDone in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizDone';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the quizDone by a student.
     *
     * @param studentID student id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllByStudent = function (studentID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizDone, MPGain WHERE theGain = mpGainID AND theStudent = ?';
            db.all(request, [studentID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the quizDone for a specific quiz
     *
     * @param quizID quiz id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllByQuiz = function (quizID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizDone WHERE theQuiz = ?';
            db.all(request, [quizID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the quizDone with a specific id.
     *
     * @param quiz quiz id
     * @param gain gain id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the quizDone with this id if it's found
     */
    this.findByID = function (quiz, gain, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM QuizDone WHERE theQuiz = ? AND theGain = ?';
            db.all(request, [quiz, gain], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new QuizDoneDAO();
module.exports = dao;