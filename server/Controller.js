const jwt = require('jsonwebtoken');
const config = require('./config');
const tokenProvider = require('./TokenProvider');
const connection = require('./dbconnection');
const bcrypt = require('bcryptjs');


const Controller = {

    registerUser: function(req, res, next) {
        var errors=[]
    
        if (errors.length){
            res.status(400).json({"error":errors.join(",")});
        }

        var data = {
            userName: req.body.userName,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            age: req.body.age,
        }
        
        
        var sql = 'INSERT INTO user (firstName, lastName, email, age)  VALUES (?, ?, ?, ?)'
        var params = [data.firstName, data.lastName, data.email, data.age]
        connection.query(sql, params, function (err, result) {
            if (err) {
                res.status(400).json({"error": err.message})
            }
            else {
                sql = 'INSERT INTO user_account (user_name, password, password_salt, password_hash_algorithm) VALUES (?, ?, ?, ?)'
                var salt = bcrypt.genSaltSync(8);
                var hash = bcrypt.hashSync(data.password, salt);
                params = [data.userName, hash, salt, 'bcrypt']
                connection.query(sql, params, function (err, result) {
                    if (err) {
                        res.status(400).json({"error": err.message})
                    }
                    else {
                        console.log("User successfuly registered")
                        res.json({
                            "success": true,
                            "message": "User successfuly registered",
                        })
                    }
                });
            }
        });
    },

    authenticateUser: function(req, res, next) {
        var errors=[]
    
        if (errors.length){
            res.status(400).json({"error":errors.join(",")});
            return;
        }
        
        var data = {
            userName: req.body.userName,
            password: req.body.password
        }

        var user;
        fetchName(data.userName, function(err, content) {
            if (err) {
                console.log("error" + err);
            } else {
                user = content;
                if (user[0] === [] || user[0] === null || user[0] === undefined)  {
                    console.log("Authentication failed. User not found.")
                    res.json ({
                        success: false,
                        message: 'Authentication failed. User not found.'
                    });
                } else if (user) {
                    // check if password matches
                    if (user[0].user_name != data.userName) {
                        console.log("Authentication failed. Wrong user name.")
                        res.json ({
                            success: false,
                            message: 'Authentication failed. Wrong user name.'
                        });
                    }
                    if (!bcrypt.compareSync(data.password, user[0].password)) {
                        console.log("Authentication failed. Wrong password.")
                        res.json ({
                            success: false,
                            message: 'Authentication failed. Wrong password.'
                        });
                    } else {
                        // user and password correct
                        let token = tokenProvider.generateAccessToken(data.userName);
                        console.log(token);
                        var params = [token.token, token.refresh_token, data.userName]

                        var sql = 'UPDATE user_account SET access_token = ?, refresh_token = ? WHERE user_name = ?'
                        connection.query(sql, params, function (err, result) {
                            if (err) {
                                console.log("ERROR COCCURED");
                                res.status(400).json({"error": err.message})
                            }
                            else {
                                res.json({
                                    success: true,
                                    message: 'Heres a token my guy', 
                                    token: token
                                });
                            }
                        });
                    }
                } else {
                    console.log("Error" + err.message);
                    throw err;
                }
            }
        })
    }
}

module.exports = Controller;


function fetchName(userName, callback) {
    connection.query('SELECT user_name, password FROM user_account WHERE user_name = ?', userName, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}