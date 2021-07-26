const express = require("express");
const fs = require("fs");
const path = require("path");
const connection = require('./dbconnection'); // SQL Database connection
const md5 = require("md5"); // MD5 Hashing
const port = 5000;

//variable getting information from the audios.json on the server folders.
let rawdata = fs.readFileSync(path.resolve(__dirname, "Audios.json"));
let audioTracks = JSON.parse(rawdata);

//starting server at http://localhost:5000
var app = express();

// bodyParser REQUIRED
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//routes accessible to the app.
app.get("/", (req, res) => res.send("This is a Node.js server running."));
app.get("/getAudio", (req, res) => res.send(audioTracks));

// Post Request for registering new User
app.post('/users', function (req, res, next) {
  var errors=[]
  //const firstName = req.body.firstName;
  //const lastName = req.body.lastName;

  //if (!req.body.password){
    //errors.push("No password specified");
  //}
  //if (!req.body.email){
      //errors.push("No email specified");
  //}
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
});


// Get Request to obtain all Users from DB
app.get('/users', function (req, res) {
  // Connecting to the database.
  connection.getConnection(function (err, connection) {

    // If some error occurs, we throw an error.
    if (err) {
      console.log(err);
      throw err;
    }

    // Executing the MySQL query (select all data from the 'users' table).
    connection.query('SELECT user.memID, user.dateJoined, user.firstName, user.lastName, user.age, user.email, user_account.id, user_account.user_name, user_account.password FROM user JOIN user_account ON user.memID= user_account.id ORDER BY user.memID', function (err, results, fields) {
  
    // If some error occurs, we throw an error.
    if (err) {
      console.log(err);
      throw err;
    }

    // Getting the 'response' from the database and sending it to our route. This is were the data is.
    res.send(results)
    });
  });
});



app.listen(port, () => console.log(`Example app listening on port ${port}`));