const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');
const user_dao = require('./user_dao');

const StudentDAO = function () {
    /**
     * Format a student if the input student is valid.
     *
     * @param object student to format
     * @returns the formatted Student, null if the input student can't be formatted
     */
    this.format = function (object) {
        const student = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['theUser', 'theClass', 'mp']
        }], object);
        if (!student) return null;

        if (student.mp >= 0) return student;
        return null;
    };

    /**
     * Insert a student if the jsonObject is valid.
     *
     * @param obj student to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const student = this.format(obj);
            if (!student) reject(new Error('Invalid input student!'));
            else {
                let request = 'INSERT INTO Student (theUser, theClass, mp) VALUES (?, ?, ?)';
                db.run(request, [student.theUser, student.theClass, student.mp], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a student if the jsonObject is valid.
     *
     * @param obj student with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const student = this.format(obj);
            if (!student) reject(new Error('Invalid input student!'));
            else {
                let request = 'UPDATE Student SET theClass = ?, mp = ? WHERE theUser = ?';
                db.run(request, [student.theClass, student.mp, student.theUser], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the student with his id.
     *
     * @param key student id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Student WHERE theUser = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the student in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Student';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the student in the class.
     *
     * @param classID id of the class
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Student WHERE theClass = ?';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the student and user in the class.
     *
     * @param classID id of the class
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllUserInClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Student, User WHERE theUser = userID AND theClass = ?';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the student with a specific id.
     *
     * @param key student id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the student with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Student WHERE theUser = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Insert a student and the user with it if the jsonObject is valid.
     *
     * @param obj user to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insertUser = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const clone = { ...obj};
            db.beginTransaction(function (err, transaction) {
                if (err) reject(err);
                else {
                    user_dao.insert(clone, transaction).then(id => {
                        clone.theUser = id;
                        dao.insert(clone, transaction).then(_ => {
                            transaction.commit(err => {
                                if (err) reject(err);
                                else resolve(id);
                            });
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
     * Get all the student and user in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllUser = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Student, User WHERE theUser = userID';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the student and user with a specific id.
     *
     * @param key student id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the student and user with this id if it's found
     */
    this.findUserByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Student, User WHERE theUser = userID AND theUser = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the student and user with a specific login.
     *
     * @param login student login
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the student and user with this login if it's found
     */
    this.findUserByLogin = function (login, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Student, User WHERE theUser = userID AND login = ?';
            db.all(request, [login], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new StudentDAO();
module.exports = dao;