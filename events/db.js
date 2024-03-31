const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'votre_host',
    user: 'votre_user',
    password: 'votre_mot_de_passe',
    database: 'votre_base_de_donnees'
});

connection.connect(error => {
    if (error) {
        console.error('An error occurred while connecting to the DB: ' + error.stack);
        return;
    }

    console.log('Connected to the database with thread ID: ' + connection.threadId);
});

module.exports = connection;
