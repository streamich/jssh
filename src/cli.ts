/// <reference path="typing.d.ts" />

//global._require = _require = global.require;
import fs = require('fs');
import builder = require("./builder");
import prompt = require("./reader/prompt");
var config = require('../config');


// This code splits arguments that are strings like ['--config {}'] into two arguments, like ['--config', '{}']
// This is used when we receive arguments from #! scripts as one string.
if(process.argv.length > 2) {
    var new_argv = [process.argv[0], process.argv[1]];
    for(var i = 2; i < process.argv.length; i++) {
        var arg = process.argv[i];
        if(arg.match(/^\-\-[a-z]+\s/)) {
            var space = arg.indexOf(' ');
            var option = arg.substr(0, space);
            var value = arg.substr(space + 1);
            new_argv.push(option);
            new_argv.push(value);
        } else {
            new_argv.push(arg);
        }
    }
    process.argv = new_argv;
}

var cli = require('cli');


cli.parse({
    "config-file":  ['',            'Configuration file',                       "string"],
    config:         ['',            'Configuration as JSON string',             "string"],
    code:           ["c",           "Code to evaluate",                         "string"],
    port:           ["p",           "TCP port or UNIX socket file",             "string"],
    ssh:            ["",            "SSH host",                                 "string"],
    client:         ["",            "Connect to a jssh server",                 "bool"],
    stdio:          ["s",           "Communicate through STDIO",                "bool"],
});


cli.main(function(args, options) {
    //console.log(args, options);
    var file_arg_pos = 0; // Position of a file to include in arguments list.

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

    var config_json = options.config;
    if(config_json) {
        try {
            var config3 = JSON.parse(config_json);
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
        entrypoint: config.entrypoint,
    };

    var file = '';
    if(args.length > file_arg_pos) file = args[file_arg_pos];

    // Start an SSH server.
    if(options.ssh) {
        if(!options.port) throw Error('Port --port not specified.');
        opts.ssh = options.ssh;
        opts.port = options.port;
        var SshServerApp = require("./app/SshServer");
        var app = new SshServerApp(opts);
        app.run();
        return;
    }

    // Start --port server.
    if(options.port) {
        var SocketApp = require("./app/Socket");
        var app = new SocketApp(opts);
        app.run(options.port);
        return;
    }

    builder.Builder.buildShell(opts, (err, shell) => {
        if(err) {
            console.log("Error on startup.");
            console.log(err);
            return;
        }

        // Start --headless server.
        if(options.stdio) {
            var HeadlessApp = require("./app/Headless");
            var app = new HeadlessApp(shell);
            app.run();
            return;
        }

        if(file) {
            //var ScriptFileApp = require("./app/ScriptFile");
            var RunSnippetApp = require("./app/RunSnippet");
            var app = new RunSnippetApp(shell);
            app.run(file, opts);
        }

        var start_repl = () => {
            if(!file) {
                // REPL mode.
                var ReplApp = require("./app/Repl");
                var app = new ReplApp(shell);
                app.run(opts);
            }
        };

        // Execute provided code: > jssh -c "ls()"
        if(options.code) {
            var SingleCommandApp = require("./app/SingleCommand");
            var app = new SingleCommandApp(shell);
            app.run(options.code, opts, start_repl);
        } else {
            start_repl();
        }

    });

});
