var shell = require("./shell");
var Repl = require("./Repl");
var api = require("./api");
var Console = require("./Console");
var prompt = require("./reader/prompt");
var Language = require("./Language");
var Parser = require("./Parser");
var context = require("./context/context");
var ContextMain = require("./context/Main");
var ActionCode = require("./action/Code");
var ActionExec = require("./action/Exec");
var ActionExecCode = require("./action/ExecCode");
var ActionStream = require("./action/Stream");
var History = require("./History");
var fs = require("fs");
var _ = require("lodash");
var async = require("async");
var Builder = (function () {
    function Builder() {
    }
    Builder.load = function (apis, language, callback) {
        var mylib = new api.Lib;
        mylib.build(apis);
        async.parallel([
            function (cb) {
                mylib.installIfMissing(function (err) {
                    if (err) {
                        console.log('Error while installing npm packages.');
                        console.log(err);
                    }
                    cb(); // Don't show error.
                });
            },
            function (cb) {
                Language.factory(language, cb);
            },
        ], function (err, res) {
            try {
                process.nextTick(function () {
                    callback(err, res);
                });
            }
            catch (e) {
                console.log(e);
                console.log(e.stack);
            }
        });
        return mylib;
    };
    Builder.buildShell = function (opts, callback) {
        var mylib = Builder.load(opts.apis, opts.language, function (err, res) {
            if (err)
                return callback(err);
            var language = res[1];
            var peg = fs.readFileSync(opts.grammar).toString();
            var parser = new Parser();
            parser.compileGrammar(peg);
            var myconsole = new Console;
            myconsole.isVerbose = opts.verbose;
            myconsole.printUndefined = opts.printUndefined;
            var shell_opts = {};
            var myshell = new shell.Shell;
            var mycontext = new ContextMain;
            var mysandbox = _.extend({}, context.Context.sandbox, opts.sandbox || {}, {
                shell: myshell
            });
            mycontext.start(mysandbox);
            mycontext.exportMethodsAsGlobalVariables(mylib);
            opts.require.forEach(function (pkg) {
                mycontext.requirePackage(pkg.namespace, pkg.name);
            });
            myshell.setOptions(shell_opts).setLanguage(language).setParser(parser).setLib(mylib).setConsole(myconsole).setContext(mycontext).registerActionClass("code", ActionCode).registerActionClass("exec", ActionExec).registerActionClass("exec_code", ActionExecCode).registerActionClass("stream", ActionStream);
            callback(null, myshell);
        });
    };
    Builder.buildRepl = function (opts, callback) {
        var myreader = new prompt.Prompt(opts.prompt);
        var myrepl = new Repl(myreader);
        var myhistory = new History(opts.history);
        opts.sandbox = {
            jssh: myrepl,
            hist: myhistory,
            history: myhistory
        };
        Builder.buildShell(opts, function (err, shell) {
            if (err)
                return callback(err);
            myrepl.setShell(shell).setHistory(myhistory).setConsole(shell.console);
            callback(null, myrepl);
        });
    };
    return Builder;
})();
exports.Builder = Builder;
