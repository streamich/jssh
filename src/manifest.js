/// <reference path="./typing.d.ts" />
var fs = require("fs");
var info = require("./info");
// Returns `package.json` contents.
var file = info.dir + "/package.json";
var json = fs.readFileSync(file);
var manifest = JSON.parse(json.toString());
module.exports = manifest;
