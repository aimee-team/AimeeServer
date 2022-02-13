const mysql = require("mysql");


// create connection
let connection = mysql.createPool({
    host     : 'members.cc1xl8ndzmnl.us-east-1.rds.amazonaws.com', // Your connection address (localhost).
    user     : 'AIMEEuser',     // Your database's username.
    password : 'AIMEEpw11',        // Your database's password.
    database : 'members',   // Your database's name.
    port     : 3306
});

module.exports = connection;
