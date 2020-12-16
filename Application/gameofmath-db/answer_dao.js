const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const AnswerDAO = function () {
    /**
     * Format a answer if the input answer is valid.
     *
     * @param object answer to format
     * @returns the formatted answer, null if the input answer can't be formatted
     */
    this.format = function (object) {
        const answer = object_helper.formatPropertiesWithType([{
            t: 'string',
            ps: ['text']
        }, {t: 'number', ps: ['answerID', 'theQuestion']},
            {t: 'boolean', ps: ['isValid']}], object);
        if (!answer) return null;

        return answer;
    };

    /**
     * Insert a answer if the jsonObject is valid.
     *
     * @param obj answer to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const answer = this.format(obj);
            if (!answer) reject(new Error('Invalid input answer!'));
            else {
                let request = 'INSERT INTO Answer (text, isValid, theQuestion) VALUES (?, ?, ?)';
                db.run(request, [answer.text, answer.isValid, answer.theQuestion], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a answer if the jsonObject is valid.
     *
     * @param obj answer with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const answer = this.format(obj);
            if (!answer) reject(new Error('Invalid input answer!'));
            else {
                let request = 'UPDATE Answer SET text = ?, isValid = ?, theQuestion = ? WHERE answerID = ?';
                db.run(request, [answer.text, answer.isValid, answer.theQuestion, answer.answerID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the answer with his id.
     *
     * @param key answer id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Answer WHERE answerID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the answer in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Answer';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the answer of a specific question.
     *
     * @param questionID db instance to use
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInQuestion = function (questionID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Answer WHERE theQuestion = ?';
            db.all(request, [questionID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the answer with a specific id.
     *
     * @param key answer id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the answer with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Answer WHERE answerID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new AnswerDAO();
module.exports = dao;