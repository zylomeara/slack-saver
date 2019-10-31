"use strict";
exports.__esModule = true;
var db_validators_1 = require("./db_validators");
var utils_1 = require("../utils");
var dbName = 'slack_data';
var name = 'slack_data';
function default_1(app, dbClient) {
    app.get('/backup', function (req, res) {
        var details = { '_id': 0 };
        dbClient.db(dbName).collection(name).findOne(details, function (err, item) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else {
                res.send(item);
            }
        });
    });
    app.post('/backup', function (req, res) {
        var backupData = req.body;
        var details = { '_id': 0 };
        dbClient.db(dbName).collection(name).findOne(details, function (err, item) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else if (db_validators_1.isSlackData(backupData)) {
                backupData = utils_1.mergeDeep(item, backupData);
                dbClient.db(dbName).collection(name).replaceOne(details, backupData, function (err, result) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred' });
                    }
                    else {
                        // res.send(result.ops[0]);
                        res.send({ 'success': 'Data saved' });
                    }
                });
            }
            else {
                res.send({ 'success': 'Invalid data' });
            }
        });
    });
}
exports["default"] = default_1;
