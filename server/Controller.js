const jwt = require('jsonwebtoken');
const config = require('./config');
const tokenProvider = require('./TokenProvider');
const connection = require('./dbconnection');

const Controller = {

    registerUser: function(req, res, next) {
        var errors=[]
    
        if (errors.length){
            res.status(400).json({"error":errors.join(",")});
            return;
        }

        var data = {
            userName: req.body.userName,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            age: req.body.age,
        }
        
        
        var sql = 'INSERT INTO user_account (user_name, password)  VALUES (?, ?)'
        var params = [data.userName, data.password]
        connection.query(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({"error": err.message})
            return;
        }
        });
    
    
        var sql = 'INSERT INTO user (firstName, lastName, email, age)  VALUES (?, ?, ?, ?)'
        var params = [data.firstName, data.lastName, data.email, data.age]
        connection.query(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "sucess",
            "data": data,
            "id": this.lastId
        })
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
                console.log(user[0]);
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
                    if (user[0].password != data.password) {
                        console.log("Authentication failed. Wrong password.")
                        res.json ({
                            success: false,
                            message: 'Authentication failed. Wrong password.'
                        });
                    } else {
                        // user and password correct
                        let token = tokenProvider.generateAccessToken(data.userName);
                        console.log(token);
                        res.json({
                            success: true,
                            message: 'Heres a token my guy', 
                            token: token
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
            callback(err, null)
        } else {
            callback(null, result);
        }
    });
}