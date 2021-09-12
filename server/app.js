const express = require("express");
const fs = require("fs");
const path = require("path");
const port = 5000;
const model = require('./Model');
const controller = require('./Controller');
const tokenProvider = require("./tokenProvider");
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


async function init() {
  model.dropUserAccountTable();
  await sleep(500);
  model.dropUserTable();
  await sleep(500);
  model.createUserTable();
  await sleep(500);
  model.createUserAccountTable();
  await sleep(500);
  model.addForeignKey();
  await sleep(500);
  model.populateUser();
  await sleep(500);
  model.populateUserAccount();
  await sleep(500);
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

app.post('/Register', function (req, res, next) {
  controller.registerUser(req, res, next);
});

app.get('/Refresh', controller.validate, function(req, res) {
    tokenProvider.generateNewTokens(req, res)
})


//Resource Routes
app.get("/getAudio", controller.validate, function(req, res) {
    if(req.isValid.success) {
        res.send(audioTracks)
    }
    else {
        res.status(401).send(req.isValid)
    }
});

//example route for a get request with access token
app.get('/Resource', controller.validate, function(req, res, next) {
    res.json(req.isValid);
});


app.listen(port, () => console.log(`Example app listening on port ${port}`));