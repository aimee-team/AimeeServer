const mysql = require("mysql");


// create connection
let connection = mysql.createPool({
    host     : 'localhost', // Your connection adress (localhost).
    user     : 'root',     // Your database's username.
    password : 'root',        // Your database's password.
    database : 'members'   // Your database's name.
});

module.exports = connection;
