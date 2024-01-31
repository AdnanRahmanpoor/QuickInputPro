const sqlite3 = require('sqlite3');
const path = require('path');

let db;
let columns = [];
let targetTableName = 'entries';

function connectToDatabase(databasePath) {
  if (!databasePath) {
    throw new Error('Database path is required.');
  }

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(databasePath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
      } else {
        console.log('Connected to the database.');
        fetchColumnNames(targetTableName).then(resolve).catch(reject);
      }
    });
  });
}

function fetchColumnNames(tableName) {
  return new Promise((resolve, reject) => {
    const pragmaQuery = `PRAGMA table_info(${tableName})`;

    db.all(pragmaQuery, (err, rows) => {
      if (err) {
        console.error(
          `Error fetching column names for ${tableName}`,
          err.message,
        );
        reject(err);
      } else {
        // Extract column names from result
        columns = rows.map((row) => row.name);
        console.log(`Column names for ${tableName}:`, columns);
        resolve(columns);
      }
    });
  });
}

async function fetchData(tableName) {
  try {
    
    const query = `SELECT * FROM ${tableName}`;
    const data = await db.all(query);

    return data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
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
  fetchData,
  getColumns,
  getTargetTableName,
};
