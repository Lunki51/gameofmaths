const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');
const user_dao = require('./user_dao');

const TeacherDAO = function () {
    /**
     * Format a teacher if the input teacher is valid.
     *
     * @param object teacher to format
     * @returns the formatted Teacher, null if the input teacher can't be formatted
     */
    this.format = function (object) {
        const teacher = object_helper.formatPropertiesWithType([{
            t: 'string',
            ps: ['email']
        }, {t: 'number', ps: ['theUser']}], object);
        if (!teacher) return null;

        teacher.email = teacher.email.toLowerCase();

        return teacher;
    };

    /**
     * Insert a teacher if the jsonObject is valid.
     *
     * @param obj teacher to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const teacher = this.format(obj);
            if (!teacher) reject(new Error('Invalid input teacher!'));
            else {
                let request = 'INSERT INTO Teacher (theUser, email) VALUES (?, ?)';
                db.run(request, [teacher.theUser, teacher.email], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a teacher if the jsonObject is valid.
     *
     * @param obj teacher with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const teacher = this.format(obj);
            if (!Teacher) reject(new Error('Invalid input teacher!'));
            else {
                let request = 'UPDATE Teacher SET email = ? WHERE theUser = ?';
                db.run(request, [teacher.email, teacher.theUser], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the teacher with his id.
     *
     * @param key teacher id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Teacher WHERE theUser = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the teacher in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Teacher';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the teacher with a specific id.
     *
     * @param key teacher id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the teacher with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Teacher WHERE theUser = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Insert a teacher and the userwith it if the jsonObject is valid.
     *
     * @param obj user to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insertUser = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const clone = obj.clone();
            db.beginTransaction(function (err, transaction) {
                if (err) reject(err);
                else {
                    user_dao.insert(clone, transaction).then(id => {
                        clone.theUser = id;
                        this.insert(clone, transaction).then(_ => {
                            resolve(id);
                        }).catch(err => {
                            transaction.rollback();
                            reject(err);
                        });
                    }).catch(err => {
                        transaction.rollback();
                        reject(err);
                    });
                }
            });
        })
    };

    /**
     * Get all the teacher and user in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllUser = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Teacher, User WHERE theUser = userID';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the teacher and user with a specific id.
     *
     * @param key teacher id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the teacher and user with this id if it's found
     */
    this.findUserByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Teacher, User WHERE theUser = userID AND theUser = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the teacher and user with a specific login.
     *
     * @param login teacher login
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the teacher and user with this login if it's found
     */
    this.findUserByLogin = function (login, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Teacher, User WHERE theUser = userID AND login = ?';
            db.all(request, [login], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new TeacherDAO();
module.exports = dao;