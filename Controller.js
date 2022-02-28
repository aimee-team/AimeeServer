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
            res.status(401).json({
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
                sql = 'INSERT INTO user_account (access_level, user_name, password, password_salt, password_hash_algorithm) VALUES (1, ?, ?, ?, ?)'
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
                if (user[0] === [] || user[0] === null || user[0] === undefined)  {
                    console.log("Authentication failed. User not found.")
                    res.status(401).json ({
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
                    var access_level = user[0].access_level;
                    if (!bcrypt.compareSync(data.password, user[0].password)) { /** AUTHENTICATED */

                        let success = false

                        //check if other instances of same username are correct login
                        for (let i = 0; i < user.length; i++) {
                            if (bcrypt.compareSync(data.password, user[i].password)) {
                                success = true
                                memberID = user[i].ID
                                access_level = user[i].access_level
                                // console.log(memberID)
                                break;
                            }
                        }

                        if (!success) {
                            console.log("Authentication failed. Wrong password.")
                            res.status(401).json ({
                                success: false,
                                message: 'Authentication failed. Wrong password.'
                            });
                            return;
                        }
                    }

                    // user and password correct (otherwise would've returned out of the function)
                    var token = tokenProvider.generateAccessToken(memberID, access_level, data.userName);

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
                            // console.log(result)

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
                                message: 'Heres a token', 
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
    },

    /**
     * Middleware function to validate the access token to verify that the client has a valid token to access to the resource.
     * If valid, the `isValid` property will be added to `req`, which can be used by the subsequent route handlers. The payload
     * is added to `req.isValid.payload`.
     */
    validate: function(req, res, next) {

        const header = req.headers['authorization'];
        const [scheme, token] = header.split(' ');
        if (scheme === 'Bearer' && typeof token != 'undefined' && (token != null)) {
            try {
                let payload = jwt.verify(token, config.secret);
                console.log('Authorized access')

                //add response to req so later functions can access it
                req['isValid'] = {
                    success: true,
                    message: 'Authorized access',
                    payload: payload
                }
            } catch (err) {
                req['isValid'] = {
                    success: false,
                    message: 'Invalid or expired token'
                }
            }
        }
        else {
            req['isValid'] = {
                success: false,
                message: 'Invalid request'
            }
        }

        next()
    },

    /**
     * This function takes the response that the SER model returns and updates the `emotions` database table with the new 
     * emotion entry.
     * The date is stored as an integer of the UNIX timestamp, in seconds.
     * The values of the `joy`, `anger`, and `sadness` columns are the percentages returned by the SER model. By default, the correct
     * emotion is set to 0, until the user sends their feedback.
     * @param {Request} req The request object, having been passed through the `validate` middleware
     * @param {String} emotionString The string representation of the array of 3 values the SER model returns. The order of
     * the emotions are <i>joy</i>, <i>anger</i>, and <i>sadness</i>.
     * @param {Response} res The response object to send the response back to the client. If successful, a JSON object with keys for the time
     * and the emotion percentages will be sent back.
     */
    updateEmotions: function(req, emotionString, res) {
        
        const secondsSinceEpoch = Math.round(Date.now() / 1000)
        var emotionArr = JSON.parse(emotionString)

        //update user set emotions = JSON_SET(emotions, '$.a', 10) where memID = 2;
        var sql = 'INSERT INTO emotions (memID, date, joy, anger, sadness, correct) VALUES (?, ?, ?, ?, ?, 0)'
        var params = [req.isValid.payload.memberID, secondsSinceEpoch, emotionArr[0], emotionArr[1], emotionArr[2]]

        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log(err)
                res.status(400).json({
                    "error": err.message
                })
                return;
            }
            else {
                res.status(200).json({
                    time: secondsSinceEpoch,
                    emotions: emotionString
                });
                return secondsSinceEpoch
            }
        });
    },

    /**
     * Updates the database with the user response for most accurate emotion, so as to help train the SER model. Updates the `correct` 
     * column of the `emotions` table.
     * The array is of length 4, where the last value is the indice of the most accurate emotion, an integer from 0 to 2.
     * @param {Request} req The request object, having been passed through the `validate` middleware
     * @param {Number} epochTime The unix epoch time (in seconds) of the emotion being initially analyzed. This is the primary key for the
     * database entry.
     * @param {Number} correctEmotion The indice of the most accurate emotion, as an integer from 1 to 3.
     * @param {Response} res The response object to send the response back to the client
     */
    recordCorrectEmotion: function(req, epochTime, correctEmotion, res) {

        var sql  = 'UPDATE emotions SET correct = ? WHERE date = ? AND memID = ?'
        var params = [correctEmotion, epochTime, req.isValid.payload.memberID]

        connection.query(sql, params, function (err, result) {
            if (err) {
                console.log(err)
                res.status(400).json({
                    "error": err.message
                })
                return;
            }
            else {
                if (result.changedRows == 0) {
                    res.status(404).json({
                        "error": "No entries updated or found"
                    })
                    return;
                }
                else {
                    res.status(200).json({
                        key: epochTime,
                        emotions: emotionArray
                    });
                }
                return epochTime
            }
        });
    }

}

module.exports = Controller;


function fetchName(userName, callback) {
    connection.query('SELECT user_name, access_level, password, ID FROM user_account WHERE user_name = ?', userName, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}