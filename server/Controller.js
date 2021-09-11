const jwt = require('jsonwebtoken');
const config = require('./config');
const tokenProvider = require('./TokenProvider');
const connection = require('./dbconnection');
const bcrypt = require('bcryptjs');
const validator = require("email-validator");
const passwordValidator = require('password-validator');

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
            dateJoined: new Date().toISOString().slice(0, 10),
        }
        
        /** check if email is valid */
        if (!validator.validate(data.email)) {
            res.json({
                "success": false,
                "message": "Email is not valid",
            })
            return;
        }

        var schema = new passwordValidator();
        schema.is().min(8).has().uppercase().has().lowercase().has().digits(1).has().not().spaces();

        /** check if password is valid */
        if(!schema.validate(data.password)) {
            res.json({
                "success": false,
                "message": "Your passwords moves are weak",
            })
            return;
        }

        var sql = 'INSERT INTO user (dateJoined, firstName, lastName, email, age)  VALUES (?, ?, ?, ?, ?)'
        var params = [data.dateJoined, data.firstName, data.lastName, data.email, data.age]
        connection.query(sql, params, function (err, result) {
            if (err) {
                res.status(400).json({"error": err.message})
                return;
            }
            else {
                sql = 'INSERT INTO user_account (user_name, password, password_salt, password_hash_algorithm) VALUES (?, ?, ?, ?)'
                var salt = bcrypt.genSaltSync(8); /** salt */
                var hash = bcrypt.hashSync(data.password, salt); /** hash password */
                params = [data.userName, hash, salt, 'bcrypt']
                connection.query(sql, params, function (err, result) {
                    if (err) {
                        res.status(400).json({"error": err.message})
                        return;
                    }
                    else {
                        console.log("User successfuly registered")
                        res.json({
                            "success": true,
                            "message": "User successfuly registered",
                        })
                        return;
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
                console.log(user);
                if (user[0] === [] || user[0] === null || user[0] === undefined)  {
                    console.log("Authentication failed. User not found.")
                    res.json ({
                        success: false,
                        message: 'Authentication failed. User not found.'
                    });
                    return;
                } else if (user) {
                    // check if password matches
                    if (user[0].user_name != data.userName) {
                        console.log("Authentication failed. Wrong user name.")
                        res.json ({
                            success: false,
                            message: 'Authentication failed. Wrong user name.'
                        });
                        return;
                    }
                    var memberID = user[0].ID;
                    if (!bcrypt.compareSync(data.password, user[0].password)) { /** AUTHENTICATED */

                        let success = false

                        //check if other instances of same username are correct login
                        for (let i = 0; i < user.length; i++) {
                            if (bcrypt.compareSync(data.password, user[i].password)) {
                                success = true
                                memberID = user[i].ID
                                console.log(memberID)
                                break;
                            }
                        }

                        if (!success) {
                            console.log("Authentication failed. Wrong password.")
                            res.json ({
                                success: false,
                                message: 'Authentication failed. Wrong password.'
                            });
                            return;
                        }
                    }

                    // user and password correct (otherwise would've returned out of the function)
                    var token = tokenProvider.generateAccessToken(memberID, data.userName);

                    //get IDtoken
                    var sql = 'SELECT * from user where memID = ?'
                    var params = [memberID]
                    connection.query(sql, params, function (err, result) {
                        if (err) {
                            console.log("error" + err);
                            res.status(400).json({"error": err.message})
                            return;
                        }
                        else {
                            console.log(result)

                            let userData = {
                                dateJoined: result[0].dateJoined,
                                username: data.userName,
                                firstName: result[0].firstName,
                                lastName: result[0].lastName,
                                email: result[0].email,
                                age: result[0].age,
                            }

                            token['id_token'] = tokenProvider.generateIDToken(userData)

                            //return all tokens
                            res.json({
                                success: true,
                                message: 'Heres a token my guy', 
                                token: token
                            });
                        }
                    })
                    
                    
                    // Don't need to store tokens in database, as they can just be verified by the server instead
                    // var params = [token.token, token.refresh_token, data.userName]

                    // var sql = 'UPDATE user_account SET access_token = ?, refresh_token = ? WHERE user_name = ?'
                    // connection.query(sql, params, function (err, result) {
                    //     if (err) {
                    //         console.log("ERROR COCCURED");
                    //         res.status(400).json({"error": err.message})
                    //         return;
                    //     }
                    //     else {
                    //         res.json({
                    //             success: true,
                    //             message: 'Heres a token my guy', 
                    //             token: token
                    //         });
                    //     }
                    // });
                    
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
    connection.query('SELECT user_name, password, ID FROM user_account WHERE user_name = ?', userName, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}