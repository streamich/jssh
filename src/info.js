/// <reference path="typing.d.ts" />
var path = require("path");
var mainfile = process.mainModule.filename;
var dir = path.dirname(__dirname);
var info = {
    main: mainfile,
    dir: dir
};
module.exports = info;
