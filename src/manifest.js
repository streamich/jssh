// Returns `package.json` contents.

 var fs = require("fs");


var file = __dirname + "/../package.json";
var json = fs.readFileSync(file);
var manifest = JSON.parse(json);
module.exports = manifest;