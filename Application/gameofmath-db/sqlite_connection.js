const sqlite3 = require('sqlite3').verbose();
const TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;

const db = new TransactionDatabase(new sqlite3.Database('../gameofmath.db'));

module.exports = db;