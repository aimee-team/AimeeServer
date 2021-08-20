const express = require("express");
const fs = require("fs");
const path = require("path");
const port = 5000;
const model = require('./Model');
const controller = require('./Controller');
const connection = require('./dbconnection');


//variable getting information from the audios.json on the server folders.
let rawdata = fs.readFileSync(path.resolve(__dirname, "Audios.json"));
let audioTracks = JSON.parse(rawdata);

//starting server at http://localhost:5000
var app = express();

// bodyParser REQUIRED
var bodyParser = require('body-parser');
const { connect } = require("http2");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//routes accessible to the app.
app.get("/", (req, res) => res.send("This is a Node.js server running."));
app.get("/getAudio", (req, res) => res.send(audioTracks));


async function init() {
  model.dropUserAccountTable();
  await sleep(300);
  model.dropUserTable();
  await sleep(300);
  model.createUserTable();
  await sleep(300);
  model.createUserAccountTable();
  await sleep(300);
  model.addForeignKey();
  await sleep(300);
  model.populateUser();
  await sleep(300);
  model.populateUserAccount();
  console.log("Finished setup");
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

init();


app.post('/Login', function (req, res, next) {
  controller.authenticateUser(req, res, next);
});



app.listen(port, () => console.log(`Example app listening on port ${port}`));