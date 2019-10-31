"use strict";
exports.__esModule = true;
var note_routes_1 = require("./note_routes");
var db_routes_1 = require("./db_routes");
// @ts-ignore
function default_1(app, dbClient) {
    note_routes_1["default"](app, dbClient);
    db_routes_1["default"](app, dbClient);
}
exports["default"] = default_1;
