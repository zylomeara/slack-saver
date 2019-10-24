"use strict";
exports.__esModule = true;
function default_1(app, dbClient) {
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
