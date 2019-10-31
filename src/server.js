"use strict";
exports.__esModule = true;
var express = require("express");
var cors = require("cors");
var routes_1 = require("./app/routes");
var db_1 = require("./config/db");
var mongodb_1 = require("mongodb");
var bodyParser = require("body-parser");
var app = express();
var port = 3000;
var client = new mongodb_1.MongoClient(db_1["default"].url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(function (req, res, next) {
    var date = new Date().toLocaleString('ru');
    process.stdout.write("\n[" + date + "]: " + req.method + " " + req.originalUrl + " ...");
    res.on('finish', function () {
        // process.stdout.clearLine(0);
        // process.stdout.cursorTo(0);
        // process.stdout.write(`[${date}]: ${req.method} ${req.originalUrl} ${res.statusCode}`);
        console.info("[" + date + "]: " + req.method + " " + req.originalUrl + " " + res.statusCode);
    });
    next();
});
app.get('/', function (request, response) {
    response.send("\n<form action=\"/\" method=\"post\">\n    <input name=\"message\" value=\"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435\">\n    <button type=\"submit\">\n</form>\n");
});
app.post('/', function (request, response) {
    console.log(request.body);
    response.send('<b>Hello from Express!!!</b>');
});
client.connect(function (err) {
    if (err)
        return console.log(err);
    routes_1["default"](app, client);
    // https.createServer({
    //     key: fs.readFileSync('server.key'),
    //     cert: fs.readFileSync('server.cert')
    // }, app).listen(port, () => {
    app.listen(port, function () {
        console.log("server is listening on http://localhost:" + port + "/");
    });
});
process.on('SIGINT', function () {
    client.close();
    process.exit();
});
