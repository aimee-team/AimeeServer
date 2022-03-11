const mysql = require("mysql");


// create connection
let connection = mysql.createPool({
    host     : 'members.cc1xl8ndzmnl.us-east-1.rds.amazonaws.com', // Your connection address (localhost).
    user     : 'AIMEEuser',     // Your database's username.
    password : 'AIMEEpw11',        // Your database's password.
    database : 'members',   // Your database's name.
    port     : 3306,
    multipleStatements: true
});

// let connection = mysql.createPool({
//     host     : 'localhost', // Your connection address (localhost).
//     user     : 'root',     // Your database's username.
//     password : 'root',        // Your database's password.
//     database : 'members',   // Your database's name.
//     multipleStatements: true
// });

module.exports = connection;
