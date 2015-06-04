/// <reference path="./typing.d.ts" />
import fs = require("fs");
import info = require("./info");


// Returns `package.json` contents.
var file = info.dir + "/package.json";
var json = fs.readFileSync(file);
var manifest: {
   name: string;
} = JSON.parse(json.toString());
export = manifest;