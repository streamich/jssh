/// <reference path="typing.d.ts" />


export = Parser; class Parser {

    parser;

    compileGrammar(grammar) {
        var PEG = require("pegjs");
        this.parser = PEG.buildParser(grammar, {
            optimize: "speed",
        });
    }

    parse(command) {
        return this.parser.parse(command);
    }

}