const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const QuestionDAO = function () {
    /**
     * Format a question if the input question is valid.
     *
     * @param object question to format
     * @returns the formatted question, null if the input question can't be formatted
     */
    this.format = function (object) {
        const question = object_helper.formatPropertiesWithType([{
            t: 'string',
            ps: ['upperText', 'lowerText', 'image', 'type']
        }, {t: 'number', ps: ['questionID', 'level', 'theChapter']}], object);
        if (!question) return null;

        if (['QCM', 'QCU', 'OPEN'].indexOf(question.type) >= 0) return question;
        return null;
    };

    /**
     * Insert a question if the jsonObject is valid.
     *
     * @param obj question to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const question = this.format(obj);
            if (!question) reject(new Error('Invalid input question!'));
            else {
                let request = 'INSERT INTO Question (upperText, lowerText, image, type, level, theChapter) VALUES (?, ?, ?, ?, ?, ?)';
                db.run(request, [question.upperText, question.lowerText, question.image, question.type, question.level, question.theChapter], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a question if the jsonObject is valid.
     *
     * @param obj question with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const question = this.format(obj);
            if (!question) reject(new Error('Invalid input question!'));
            else {
                let request = 'UPDATE Question SET upperText = ?, lowerText = ?, image = ?, type = ?, level = ?, theChapter = ? WHERE questionID = ?';
                db.run(request, [question.upperText, question.lowerText, question.image, question.type, question.level, question.theChapter, question.questionID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the question with his id.
     *
     * @param key question id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Question WHERE questionID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the question in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Question';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the question in the chapter.
     *
     * @param chapterID chapter id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInChapter = function (chapterID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Question WHERE theChapter = ?';
            db.all(request, [chapterID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the question with a specific level.
     *
     * @param level chapter id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllByLevel = function (level, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Question WHERE level = ?';
            db.all(request, [level], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the question with a specific id.
     *
     * @param key question id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the question with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Question WHERE questionID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new QuestionDAO();
module.exports = dao;