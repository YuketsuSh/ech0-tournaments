const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'YOUR_HOST',
    user: 'YOUR_USER',
    password: 'YOUR_PASSWORD',
    database: 'YOUR_DATABASE'
});

connection.connect(error => {
    if (error) {
        console.error('An error occurred while connecting to the DB: ' + error.stack);
        return;
    }

    console.log('Connected to the database with thread ID: ' + connection.threadId);
});

module.exports = connection;
