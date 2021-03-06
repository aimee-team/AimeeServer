const express = require("express");
const fs = require("fs");
const Axios = require("axios");
const path = require("path");
const port = 5000;
const model = require('./Model');
const controller = require('./Controller');
const tokenProvider = require("./TokenProvider");
const connection = require('./dbconnection');

const AIurl = "http://localhost:5000/api/ai";       //change to route for Gateway API for aws lambda instance for the python ai script


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


// async function init() {
//   model.dropUserAccountTable();
//   await sleep(500);
//   model.dropEmotionsTable();
//   await sleep(500);
//   model.dropUserTable();
//   await sleep(500);
//   model.createUserTable();
//   await sleep(500);
//   model.createEmotionsTable();
//   await sleep(500);
//   model.createUserAccountTable();
//   await sleep(500);
//   model.addForeignKey();
//   await sleep(500);
//   model.populateUser();
//   await sleep(500);
//   model.populateUserAccount();
//   await sleep(500);
//   console.log("Finished setup");
// }

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

// init();      //resets the database


app.post('/Login', function (req, res, next) {
    controller.authenticateUser(req, res, next);
});

app.post('/Register', function (req, res, next) {
    controller.registerUser(req, res, next);
});

app.get('/Refresh', controller.validate, function(req, res) {
    tokenProvider.generateNewTokens(req, res)
})

//example route for a get request with access token
app.get('/Resource', controller.validate, function(req, res, next) {
    res.json(req.isValid);
});

//Resource Routes
app.get("/getAudio", controller.validate, function(req, res) {
    if(req.isValid.success) {
        res.send(audioTracks)
    }
    else {
        res.status(401).send(req.isValid)
    }
});

/**
 * AI response
 * Requires the body values:
 * ```
 * input: String
 * ```
 */
app.post("/SER", controller.validate, function(req, res) {
    if(req.isValid.success) {

        var emotionString = ''
        var spawn = require("child_process").spawn;

        var pyprocess = spawn('python3', ["main.py", req.body.input], {
            cwd: "./SER/NLP"
        });


        // Takes stdout data from script which executed
        // with arguments and send this data to res object
        pyprocess.stdout.on('data', function (data) {
            initString = data.toString().trim();           //get just the array
            let emotionString = "";                         
            for (var i = 0; i < initString.length; i++) {           //turn [0.4 0.8 0.9] into [0.4, 0.8, 0.9]
                if (initString.charAt(i) != ' ') {
                    emotionString += initString.charAt(i);
                } else {
                    emotionString += ', '
                    while (initString.charAt(i + 1) === ' ') {
                        i++;
                    }
                }
            }
            var epochTime = controller.updateEmotions(req, emotionString, res);
        
        })

        pyprocess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pyprocess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        //send request to the AI lambda function
        // let getReq = Axios.get(AIurl + '/SER', {                      //change to actual route for lambda function
        //     headers: {
        //         'Authorization': 'Bearer ' + req.headers['authorization']
        //     },
        //     params: {
        //         'input': req.params.input
        //     }
        // }).then(function(response) {
        //     if(response.data.success) {
        //         res.send(response.data.message)
        //     }
        //     else {
        //         res.status(401).send(response.data.message)
        //     }
        // })
        // .catch((error) => {
        //     console.log(error);
        // });
    }
    else {
        res.status(401).send(req.isValid)
    }
});

/**
 * Requires the following body values:
 * ```
 * epochTime: int
 * correctEmotion: int ??? {1, 2, 3}
 * ```
 */
app.post("/SERfeedback", controller.validate, function(req, res) {
    if(req.isValid.success) {
        controller.recordCorrectEmotion(
            req, 
            JSON.parse(req.body.epochTime), 
            JSON.parse(req.body.correctEmotion),  
            res
        );
    }
    else {
        res.status(401).send(req.isValid)
    }
});

/**
 * Requires a `startTime` and `endTime` params.
 * Time should be in unix time (seconds).
 */
app.get("/getEmotions", controller.validate, function(req, res) {
    if(req.isValid.success) {
        controller.getEmotions(req, req.query.startTime, req.query.endTime, res);
    }
    else {
        res.status(401).send(req.isValid)
    }
});



app.listen(port, () => console.log(`Example app listening on port ${port}`));