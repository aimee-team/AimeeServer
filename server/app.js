const express = require("express");
const fs = require("fs");
const path = require("path");
//const bodyParser = require("body-parser");
const connection = require('./dbconnection');
//app.use(bodyParser.json({type: 'application/json'}))
//app.use(bodyParser.urlencoded({ extended: true}))
const port = 5000;

//variable getting information from the audios.json on the server folders.
let rawdata = fs.readFileSync(path.resolve(__dirname, "Audios.json"));
let audioTracks = JSON.parse(rawdata);

//starting server at http://localhost:5000
var app = express();

//routes accessible to the app.
app.get("/", (req, res) => res.send("This is a Node.js server running."));
app.get("/getAudio", (req, res) => res.send(audioTracks));

app.get('/users', function (req, res) {
    // Connecting to the database.
    connection.getConnection(function (err, connection) {

     // If some error occurs, we throw an error.
     if (err) {
         console.log(err);
         throw err;
         return; 
     }

    // Executing the MySQL query (select all data from the 'users' table).
    connection.query('SELECT * FROM user', function (error, results, fields) {
     

      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));