const mysql = require('mysql');
const { dbhost, dbuser, dbpass, dbname } = require('../config.json');
const connection = mysql.createConnection({
    host: `${dbhost}`,
    user: `${dbuser}`,
    password: `${dbpass}`,
    database: `${dbname}`
});

connection.connect(error => {
    if (error) {
        console.error('An error occurred while connecting to the DB: ' + error.stack);
        return;
    }

    console.log('Connected to the database with thread ID: ' + connection.threadId);
});

module.exports = connection;
