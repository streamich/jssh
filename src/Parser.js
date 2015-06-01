/// <reference path="typing.d.ts" />
var Parser = (function () {
    function Parser() {
    }
    Parser.prototype.compileGrammar = function (grammar) {
        var PEG = require("pegjs");
        this.parser = PEG.buildParser(grammar, {
            optimize: "speed"
        });
    };
    Parser.prototype.parse = function (command) {
        return this.parser.parse(command);
    };
    return Parser;
})();
module.exports = Parser;
