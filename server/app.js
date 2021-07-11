const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 5000;

//variable getting information from the audios.json on the server folders.
let rawdata = fs.readFileSync(path.resolve(__dirname, "Audios.json"));
let audioTracks = JSON.parse(rawdata);

//routes accessible to the app.
app.get("/", (req, res) => res.send("This is a Node.js server running."));
app.get("/getAudio", (req, res) => res.send(audioTracks));

app.listen(port, () => console.log(`Example app listening on port ${port}`));
