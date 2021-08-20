const express = require("express");
const fs = require("fs");
const path = require("path");
const port = 5000;

//variable getting information from the audios.json on the server folders.
let rawdata = fs.readFileSync(path.resolve(__dirname, "Audios.json"));
let audioTracks = JSON.parse(rawdata);

//starting server at http://localhost:5000
var app = express();

// bodyParser REQUIRED
var bodyParser = require('body-parser');
const connection = require('./dbconnection');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//routes accessible to the app.
app.get("/", (req, res) => res.send("This is a Node.js server running."));
app.get("/getAudio", (req, res) => res.send(audioTracks));

// create tables user && user_account
connection.getConnection(async (err) => {
  if (err) {
    console.log(err.message);
    throw err;
  }
  console.log("Connected!");

  
  var sql = "DROP TABLE IF EXISTS user"
  await connection.query(sql, function (err, results) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("user table dropped");
    sql = "CREATE TABLE user ( memID INTEGER NOT NULL AUTO_INCREMENT, dateJoined DATE, firstName VARCHAR(60), lastName VARCHAR(60), age INTEGER, email VARCHAR(254), PRIMARY KEY(memID))"
  })

    await connection.query(sql, function (err, results) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("user table created");
    sql = "DROP TABLE IF EXISTS user_account"
  })

  await connection.query(sql, function (err, results) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("user_account table dropped");
    sql = "CREATE TABLE user_account ( ID INTEGER NOT NULL AUTO_INCREMENT, user_name VARCHAR(60), password VARCHAR(60), password_salt VARCHAR(60), password_hash_algorithm VARCHAR(60), access_token VARCHAR(260), refresh_token VARCHAR(260), PRIMARY KEY(ID))"

  })

  await connection.query(sql, function (err, results) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("user_account table created");
    sql = "ALTER TABLE user_account ADD FOREIGN KEY (ID) REFERENCES user(memID)"

  })

  await connection.query(sql, function (err, results) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("added foreign key");
  })
});// SQL Database connection





// Post Request for registering new User
app.post('/users', function (req, res, next) {
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