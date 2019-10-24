"use strict";
exports.__esModule = true;
var express = require("express");
var cors = require("cors");
var routes_1 = require("./app/routes/");
var db_1 = require("./config/db");
var mongodb_1 = require("mongodb");
var app = express();
var port = 3000;
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.get('/', function (request, response) {
    response.send('Hello from Express!');
});
app.post('/', function (request, response) {
    console.log(request.body);
    response.send('Hello from Express!!!');
});
mongodb_1.MongoClient.connect(db_1["default"].url, function (err, dbClient) {
    if (err)
        return console.log(err);
    routes_1["default"](app, dbClient);
    // https.createServer({
    //     key: fs.readFileSync('server.key'),
    //     cert: fs.readFileSync('server.cert')
    // }, app).listen(port, () => {
    app.listen(port, function () {
        console.log("server is listening on " + port);
    });
});
