const connection = require('./dbconnection');

/*
    user
        memID INTEGER NOT NULL AUTO_INCREMENT, 
        dateJoined DATE, 
        firstName VARCHAR(60), 
        lastName VARCHAR(60), 
        age INTEGER, 
        email VARCHAR(254), 
        emotions JSON,
        PRIMARY KEY(memID))"

    user_account
        ID INTEGER NOT NULL AUTO_INCREMENT, 
        access_level INTEGER,
        user_name VARCHAR(60), 
        password VARCHAR(60), 
        password_salt VARCHAR(60), 
        password_hash_algorithm VARCHAR(60), 
        access_token VARCHAR(260), 
        refresh_token VARCHAR(260), 
        PRIMARY KEY(ID))"
*/

const Model = {
    
    createUserTable: function() {
        connection.getConnection((err) => {
            if (err) {
              console.log(err.message);
              throw err;
            } 

            let sql = "CREATE TABLE user ( memID INTEGER NOT NULL AUTO_INCREMENT, dateJoined DATE, firstName VARCHAR(60), lastName VARCHAR(60), age INTEGER, email VARCHAR(254), emotions JSON, PRIMARY KEY(memID))"
            connection.query(sql, function (err, results) {
              if (err) {
                console.log(err.message);
                throw err;
              }
              console.log("user table created");
            });
        });
    },

    dropEmotionsTable: function() {
        connection.getConnection((err) => {
            if (err) {
              console.log(err.message);
              throw err;
            } 

            let sql = "DROP TABLE IF EXISTS emotions";
            connection.query(sql, function (err, results) {
              if (err) {
                console.log(err.message);
                throw err;
              }
              console.log("emotions table dropped");
            });
        });
    },


    createUserAccountTable: function() {
        connection.getConnection((err) => {
            if (err) {
              console.log(err.message);
              throw err;
            } 

            let sql = "CREATE TABLE user_account ( ID INTEGER NOT NULL AUTO_INCREMENT, access_level INTEGER, user_name VARCHAR(60), password VARCHAR(60), password_salt VARCHAR(60), password_hash_algorithm VARCHAR(60), access_token VARCHAR(260), refresh_token VARCHAR(260), PRIMARY KEY(ID))"
            connection.query(sql, function (err, results) {
              if (err) {
                console.log(err.message);
                throw err;
              }
              console.log("user_account table created");
            });
        });
    },

    dropUserTable: function() {
        connection.getConnection((err) => {
            if (err) {
              console.log(err.message);
              throw err;
            } 

            let sql = "DROP TABLE IF EXISTS user";
            connection.query(sql, function (err, results) {
              if (err) {
                console.log(err.message);
                throw err;
              }
              console.log("user table dropped");
            });
        });
    },

    dropUserAccountTable: function() {
        connection.getConnection((err) => {
            if (err) {
              console.log(err.message);
              throw err;
            } 

            let sql = "DROP TABLE IF EXISTS user_account";
            connection.query(sql, function (err, results) {
              if (err) {
                console.log(err.message);
                throw err;
              }
              console.log("user_account table dropped");
            });
        });
    },

    addForeignKey: function() {
        connection.getConnection((err) => {
            if (err) {
              console.log(err.message);
              throw err;
            } 

            let sql = "ALTER TABLE user_account ADD FOREIGN KEY (ID) REFERENCES user(memID)"
            connection.query(sql, function (err, results) {
              if (err) {
                console.log(err.message);
                throw err;
              }
              console.log("foreign keys created");
            });
        });

    },

    populateUserAccount: function() {
        var sql = "INSERT INTO user_account (access_level, user_name, password) VALUES (1, 't', 't')"
        connection.getConnection((err) => {
            if (err) {
                console.log(err.message);
                throw err;
            }
           

            connection.query(sql, function (err, results) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log("populated user_account table for testing purposes");
            })
        });
    },

    populateUser: function() {
        let date = new Date();
        let dateString = date.getFullYear() + '-' +date.getMonth() + '-' + date.getDate();
       
        var sql = "INSERT INTO user VALUES (?, ?, ?, ?, ?, ?, ?)"
        var params = [0, dateString, 't', 't', 20, 't', '{}']
        connection.getConnection((err) => {
            if (err) {
                console.log(err.message);
                throw err;
            }

            connection.query(sql, params, function (err, results) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log("populated user table for testing purposes");
            })
        });
    },

    /** Getters && Setters Querys */
}

module.exports = Model;