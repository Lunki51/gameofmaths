const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const ClassDAO = function () {
    /**
     * Format a class if the input class is valid.
     *
     * @param object class to format
     * @returns the formatted class, null if the input class can't be formatted
     */
    this.format = function (object) {
        const classO = object_helper.formatPropertiesWithType([{
            t: 'string',
            ps: ['grade', 'name']
        }, {t: 'number', ps: ['classID']}], object);
        if (!classO) return null;

        return classO;
    };

    /**
     * Insert a class if the jsonObject is valid.
     *
     * @param obj class to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const classO = this.format(obj);
            if (!classO) reject(new Error('Invalid input class!'));
            else {
                let request = 'INSERT INTO Class (grade, name) VALUES (?, ?)';
                db.run(request, [classO.grade, classO.name], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a class if the jsonObject is valid.
     *
     * @param obj class with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const classO = this.format(obj);
            if (!classO) reject(new Error('Invalid input class!'));
            else {
                let request = 'UPDATE Class SET grade = ?, name = ? WHERE classID = ?';
                db.run(request, [classO.grade, classO.name, classO.classID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the class with his id.
     *
     * @param key class id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Class WHERE classID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the class in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Class';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the class with a specific id.
     *
     * @param key class id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the class with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Class WHERE classID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the class with a specific grade and name.
     *
     * @param grade class's grade
     * @param name class's name
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the class with this grade and name if it's found
     */
    this.findByGradeName = function (grade, name, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Class WHERE LOWER(name) = LOWER(?) AND LOWER(grade) = LOWER(?)';
            db.all(request, [name, grade], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new ClassDAO();
module.exports = dao;