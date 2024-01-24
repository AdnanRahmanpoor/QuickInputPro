const sqlite3 = require('sqlite3');
const path = require('path');

let db;

let columns = [];
let targetTableName = 'entries';

function connectToDatabase(databasePath) {
  if (!databasePath) {
    throw new Error('Database path is required.');
  }

  db = new sqlite3.Database(databasePath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the database.');
      fetchColumnNames(targetTableName);
    }
  });
}

function fetchColumnNames(tableName) {
  const pragmaQuery = `PRAGMA table_info(${tableName})`;

  db.all(pragmaQuery, (err, rows) => {
    if (err) {
      console.error(
        `Error fetching column names for ${tableName}`,
        err.message,
      );
    } else {
      // Extract column names from result
      columns = rows.map((row) => row.name);
      console.log(`Column names for ${tableName}:`, columns);
    }
  });
}

function getColumns() {
  return columns;
}

function getTargetTableName() {
  return targetTableName;
}

module.exports = {
  connectToDatabase,
  fetchColumnNames,
  getColumns,
  getTargetTableName,
};
