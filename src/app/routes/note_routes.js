"use strict";
exports.__esModule = true;
var mongodb_1 = require("mongodb");
function default_1(app, dbClient) {
    app["delete"]('/notes/:id', function (req, res) {
        var id = req.params.id;
        var details = { '_id': new mongodb_1.ObjectID(id) };
        dbClient.db('notes').collection('notes').deleteOne(details, function (err, item) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else {
                res.send('Note ' + req.params.id + ' deleted!');
            }
        });
    });
    app.get('/notes/:id', function (req, res) {
        var id = req.params.id;
        var details = { '_id': new mongodb_1.ObjectID(id) };
        dbClient.db('notes').collection('notes').findOne(details, function (err, item) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else {
                res.send(item);
            }
        });
    });
    app.put('/notes/:id', function (req, res) {
        var id = req.params.id;
        var details = { '_id': new mongodb_1.ObjectID(id) };
        var note = { text: req.body.body, title: req.body.title };
        dbClient.db('notes').collection('notes').updateOne(details, note, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else {
                res.send(note);
            }
        });
    });
    app.post('/notes', function (req, res) {
        var note = { text: req.body.body, title: req.body.title };
        dbClient.db('notes').collection('notes').insertOne(note, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            }
            else {
                res.send(result.ops[0]);
            }
        });
    });
}
exports["default"] = default_1;
