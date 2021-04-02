const dbD = require('gameofmath-db').db;
const object_helper = require('gameofmath-db').object_helper;

const CastleDAO = function () {
    /**
     * Format a castle if the input castle is valid.
     *
     * @param object castle to format
     * @returns the formatted castle, null if the input castle can't be formatted
     */
    this.format = function (object) {
        const castle = object_helper.formatPropertiesWithType([{
            t: 'number',
            ps: ['castleID', 'castleClass']
        }, {t: 'string', ps: ['castleName']}], object);
        if (!castle) return null;

        return castle;
    };

    /**
     * Insert a castle if the jsonObject is valid.
     *
     * @param obj castle to insert
     * @param db db instance to use
     * @returns {Promise<number>} A promise that resolve the insertID
     */
    this.insert = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const castle = this.format(obj);
            if (!castle) reject(new Error('Invalid input castle!'));
            else {
                let request = 'INSERT INTO Castle (castleName, castleClass) VALUES (?, ?)';
                db.run(request, [castle.castleName, castle.castleClass], function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }

        })
    };

    /**
     * Update a castle if the jsonObject is valid.
     *
     * @param obj castle with new property (must have a correct id)
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the update is a success
     */
    this.update = function (obj, db = dbD) {
        return new Promise((resolve, reject) => {
            const castle = this.format(obj);
            if (!castle) reject(new Error('Invalid input castle!'));
            else {
                let request = 'UPDATE Castle SET castleName = ?, castleClass = ? WHERE castleID = ?';
                db.run(request, [castle.castleName, castle.castleClass, castle.castleID], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }
        })

    };

    /**
     * Delete the castle with his id.
     *
     * @param key castle id
     * @param db db instance to use
     * @returns {Promise} a promise that resolve if the delete is a success
     */
    this.delete = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'DELETE FROM Castle WHERE castleID = ?';
            db.run(request, [key], function (err) {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    /**
     * Get all the castle in the db.
     *
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAll = function (db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Castle';
            db.all(request, [], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get all the castle in the class.
     *
     * @param classID class id
     * @param db db instance to use
     * @returns {Promise<Array>} A promise that resolve all the rows
     */
    this.findAllOfClass = function (classID, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Castle WHERE castleClass = ?';
            db.all(request, [classID], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    /**
     * Get the castle with a specific id.
     *
     * @param key castle id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the castle with this id if it's found
     */
    this.findByID = function (key, db = dbD) {
        return new Promise((resolve, reject) => {
            let request = 'SELECT * FROM Castle WHERE castleID = ?';
            db.all(request, [key], function (err, rows) {
                if (err) reject(err);
                else resolve(rows[0]);
            });
        });
    };
}

var dao = new CastleDAO();
module.exports = dao;