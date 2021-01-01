const dbD = require('./sqlite_connection');
const object_helper = require('./object_helper');

const UserDAO = function () {
    /**
     * Format a user if the input user is valid.
     *
     * @param object user to format
     * @returns the formatted user, null if the input user can't be formatted
     */
    this.format = function (object) {
        const user = object_helper.formatPropertiesWithType([{
            t: 'string',
            ps: ['login', 'password', 'lastname', 'firstname']
        }, {t: 'number', ps: ['userID']}], object);
        if (!user) return null;

        user.lastname = user.lastname.toLowerCase();
        user.firstname = user.firstname.toLowerCase();

        if (user.password.length >= 7) return user;
        return null;
    };

    /**
     * Insert a user if the jsonObject is valid.
     *
     * @param obj user to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const user = this.format(obj);
            if (!user) reject(new Error('Invalid input user!'));
            else {
                let request = 'INSERT INTO User (login, password, lastname, firstname) VALUES (?, ?, ?, ?)';
                db.run(request, [user.login, user.password, user.lastname, user.firstname], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a user if the jsonObject is valid.
     *
     * @param obj user with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const user = this.format(obj);
            if (!user) reject(new Error('Invalid input user!'));
            else {
                let request = 'UPDATE User SET login = ?, password = ?, lastname = ?, firstname = ? WHERE userID = ?';
                db.run(request, [user.login, user.password, user.lastname, user.firstname, user.userID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the user with his id.
     *
     * @param key user id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM User WHERE userID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the user in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM User';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the user with a specific id.
     *
     * @param key user id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the user with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM User WHERE userID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };

    /**
     * Get the user with a specific login.
     *
     * @param login user login
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the user with this login if it's found
     */
    this.findByLogin = function (login, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM User WHERE LOWER(login) = LOWER(?)';
            db.all(request, [login], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new UserDAO();
module.exports = dao;