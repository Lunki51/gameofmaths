const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const ChapterDAO = function () {
    /**
     * Format a chapter if the input chapter is valid.
     *
     * @param object chapter to format
     * @returns the formatted chapter, null if the input chapter can't be formatted
     */
    this.format = function (object) {
        const chapter = object_helper.formatPropertiesWithType([{
            t: 'string',
            ps: ['name']
        }, {t: 'number', ps: ['chapterID']}], object);
        if (!chapter) return null;

        chapter.name = chapter.name.toLowerCase();

        return chapter;
    };

    /**
     * Insert a chapter if the jsonObject is valid.
     *
     * @param obj chapter to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const chapter = this.format(obj);
            if (!chapter) reject(new Error('Invalid input chapter!'));
            else {
                let request = 'INSERT INTO Chapter (name) VALUES (?)';
                db.run(request, [chapter.name], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a chapter if the jsonObject is valid.
     *
     * @param obj chapter with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const chapter = this.format(obj);
            if (!chapter) reject(new Error('Invalid input chapter!'));
            else {
                let request = 'UPDATE Chapter SET name = ? WHERE chapterID = ?';
                db.run(request, [chapter.name, chapter.chapterID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the chapter with his id.
     *
     * @param key chapter id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Chapter WHERE chapterID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the chapter in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Chapter';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the chapter with a specific id.
     *
     * @param key chapter id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the chapter with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Chapter WHERE chapterID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the chapter with a specific name.
     *
     * @param login chapter login
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the chapter with this name if it's found
     */
    this.findByName = function (name, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Chapter WHERE LOWER(name) = LOWER(?)';
            db.all(request, [name], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new ChapterDAO();
module.exports = dao;