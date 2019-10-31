"use strict";
exports.__esModule = true;
exports.isSlackData = function (data) {
    return typeof data === 'object'
        && data.channels
        && data.members
        && data.messages;
};
