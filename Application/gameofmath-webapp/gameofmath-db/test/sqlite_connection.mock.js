const sqlite3 = require('sqlite3').verbose();
const TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;
const fs = require('fs');

const db = new TransactionDatabase(new sqlite3.Database(':memory:'));
db.run("PRAGMA foreign_keys = ON");
db.reset = async function (done) {
    const data = fs.readFileSync('../create_db.sql').toString('utf-8').split(';');

    await db.run('BEGIN TRANSACTION;');
    for (let d of data) {
        if (d !== '') await db.run(d);
    }
    await db.run('COMMIT;');
}

module.exports = db;