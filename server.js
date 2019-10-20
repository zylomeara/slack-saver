"use strict";
exports.__esModule = true;
var express = require("express");
var fs = require("fs");
var https = require("https");
var app = express();
var port = 3000;
app.use(express.urlencoded());
app.use(express.json());
app.get('/', function (request, response) {
    response.send('Hello from Express!');
});
app.post('/', function (request, response) {
    console.log(request.body);
    // response.set('Access-Control-Allow-Origin', '*')
    response.send('Hello from Express!');
});
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(port, function () {
    // if (err) {
    //   return console.log('something bad happened', err)
    // }
    console.log("server is listening on " + port);
});
