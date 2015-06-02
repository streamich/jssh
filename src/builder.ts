import shell = require("./shell");
import Repl = require("./Repl");
import api = require("./api");
import Console = require("./Console");
import prompt = require("./reader/prompt");
import Language = require("./Language");
import Parser = require("./Parser");
import context = require("./context/context");
import ContextMain = require("./context/Main");
import ActionCode = require("./action/Code");
import ActionExec = require("./action/Exec");
import ActionExecCode = require("./action/ExecCode");
import ActionStream = require("./action/Stream");
import History = require("./History");
import fs = require("fs");
var _ = require("lodash");
var async = require("async");


export interface IPackageNamespaced {
    namespace: string;
    name: string;
}


export interface IOpts {
    apis: IPackageNamespaced[];     // A list of packages to use as global API.
    require: IPackageNamespaced[];  // var ns = require(pkg);
    prompt: string;                 // Prompt template.
    verbose: boolean;               // Whether to show lots of output.
    printUndefined: boolean;        // Whether to show print outputs, if it is a single `undefined`.
    language: string;               // Langugae, e.g.: "js", "coffee", "coco", ...
    grammar: string;                // Path to file with command line grammar.
    history: number;
    sandbox?: any;                  // Variables to add to sandbox when creating context.
}

export class Builder {

    private static load(apis, language, callback) {
        var mylib = new api.Lib;
        mylib.build(apis);
        async.parallel([
            (cb) => {
                mylib.installIfMissing((err) => {
                    if(err) {
                        console.log('Error while installing npm packages.');
                        console.log(err);
                    }
                    cb(); // Don't show error.
                });
            },
            (cb) => {
                Language.factory(language, cb);
            },
        ], (err, res) => {
            try {
                process.nextTick(() => { callback(err, res); });
            } catch(e) {
                console.log(e);
                console.log(e.stack);
            }
        });
        return mylib;
    }

    static buildShell(opts: IOpts, callback) {
        var mylib = Builder.load(opts.apis, opts.language, (err, res) => {
            if (err) return callback(err);

            var language = res[1];

            var peg = fs.readFileSync(opts.grammar).toString();
            var parser = new Parser();
            parser.compileGrammar(peg);

            var myconsole = new Console;
            myconsole.isVerbose = opts.verbose;
            myconsole.printUndefined = opts.printUndefined;

            var shell_opts:shell.IShellOptions = {};
            var myshell = new shell.Shell;

            var mycontext = new ContextMain;
            var mysandbox = _.extend({}, context.Context.sandbox, opts.sandbox || {}, {
                shell: myshell,
            });
            mycontext.start(mysandbox);
            mycontext.exportMethodsAsGlobalVariables(mylib);
            opts.require.forEach((pkg) => {
                mycontext.requirePackage(pkg.namespace, pkg.name);
            });

            myshell
                .setOptions(shell_opts)
                .setLanguage(language)
                .setParser(parser)
                .setLib(mylib)
                .setConsole(myconsole)
                .setContext(mycontext)
                .registerActionClass("code", ActionCode)
                .registerActionClass("exec", ActionExec)
                .registerActionClass("exec_code", ActionExecCode)
                .registerActionClass("stream", ActionStream);

            callback(null, myshell);
        });
    }

    static buildRepl(shell: shell.Shell, opts: IOpts) {
        var myreader = new prompt.Prompt(opts.prompt);

        var myrepl = new Repl(myreader);
        var myhistory = new History(opts.history);

        opts.sandbox = {
            sh: myrepl,
            hist: myhistory,
        };

        myrepl
            .setShell(shell)
            .setHistory(myhistory)
            .setConsole(shell.console);

        return myrepl;
    }

}