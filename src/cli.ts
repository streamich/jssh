/// <reference path="typing.d.ts" />
import builder = require("./builder");
import prompt = require("./reader/prompt");
import fs = require('fs');
var config = require('../config');
var cli = require("cli");


cli.parse({
    "config-file":  ['',            'Configuration file',                       "string"],
    config:         ['',            'Configuration as JSON string',             "string"],
    command:        ["c",           "Execute a specific command",               "string"],

    file:           ["f",           "Execute a file",                           "string"],
    //snippet:        ["s",           "Execute a file",                           "string"],
    //require:        ["r",           "require() a file",                         "string"],

    //prompt:         ["p",           "Propmt to use, default is 'jssh > '",      "string"],
    //api:            ["a",           "List of packages to use as global API",    "string",       "shelljs;util:jssh-api-util;conf:jssh-api-conf"],
    //require:        ["r",           "List of packages to require",              "string",       "_:lodash"],
    //grammar:        ["g",           "File with PEG grammar to use",             "string"],
    //lang:           ["l",           "Language to use to compile code",          "string",       "js"],
    //verbose:        ["v",           "Verbose mode",                             "boolean",      false],
    //entrypoint:     ["",            "Similar to ENTRYPOIN in Docker",           "string",       "/bin/sh -c"],
    //debug:          ["",            "Debug mode",                               "boolean",      false],
    //undef:          ["",            "Print undefined",                          "boolean",      false],
    //history:        ["",            "Length of command history",                "number",       100],
});


cli.main(function(args, options) {

    if(options['config-file']) {
        var path = require('path');
        var conffile = path.resolve(options['config-file']);
        try {
            var json = fs.readFileSync(conffile);
            var config2 = JSON.parse(json.toString());
        } catch(e) {
            console.log(e.stack || e);
            throw(Error('Error while loading config file.'))
        }
        for(var prop in config2) config[prop] = config2[prop];
    }

    if(options.config) {
        try {
            var config3 = JSON.parse(options.config);
        } catch(e) {
            console.log(e.stack || e);
            throw(Error('Error while parsing --config JSON.'))
        }
        for(var prop in config3) config[prop] = config3[prop];
    }

    if(config.debug) {
        console.log("Arguments:");
        console.log(process.argv);
        console.log("CLI options:");
        console.log(args, options);
    }

    // Prompt
    if(!config.prompt) config.prompt = prompt.Template.template;


    var grammar = config.grammar;
    if(grammar.indexOf("/") == -1) { // No slash "/", then load from "../grammar/" directory.
        grammar = __dirname + "/../grammar/" + grammar;
    } else {
        grammar = require("path").resolve(grammar);
    }

    var apis = [];
    config.api.forEach((tuple) => {
        if(!(tuple instanceof Array) || (tuple.length != 2)) throw Error('Invalid "api" property in config.');
        apis.push({namespace: tuple[0], name: tuple[1]});
    });

    var requires = [];
    config.require.forEach((tuple) => {
        if(!(tuple instanceof Array) || (tuple.length != 2)) throw Error('Invalid "require" property in config.');
        requires.push({namespace: tuple[0], name: tuple[1]});
    });

    var opts: builder.IOpts = {
        apis: apis,
        require: requires,
        prompt: config.prompt,
        verbose: config.verbose,
        printUndefined: config.undef,
        language: config.lang,
        grammar: grammar,
        history: config.history,
    };

    // Execute provided command: > jssh -c "ls()"
    if(options.command) {
        var SingleCommandApp = require("./app/SingleCommand");
        var app = new SingleCommandApp;
        app.run(options.command, opts);

    // Run through commands of some file line-by-line.
    } else if(options.file) {
        //var ScriptFileApp = require("./app/ScriptFile");
        var RunSnippetApp = require("./app/RunSnippet");
        var app = new RunSnippetApp;
        app.run(options.file, opts);

    // REPL mode.
    } else {
        var ReplApp = require("./app/Repl");
        var app = new ReplApp;
        app.run(opts);
    }

});
