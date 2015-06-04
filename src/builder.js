var shell = require("./shell");
var api = require("./api");
var Console = require("./Console");
var Language = require("./Language");
var Parser = require("./Parser");
var context = require("./context/context");
var ContextMain = require("./context/Main");
var ActionCode = require("./action/Code");
var ActionExec = require("./action/Exec");
var ActionExecCode = require("./action/ExecCode");
var ActionStream = require("./action/Stream");
var ActionRespawn = require("./action/Respawn");
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
            var myshell = new shell.Shell;
            var peg = fs.readFileSync(opts.grammar).toString();
            var parser = new Parser();
            parser.compileGrammar(peg);
            var shell_opts = {
                entrypoint: opts.entrypoint
            };
            var myconsole = new Console;
            myconsole.isVerbose = opts.verbose;
            myconsole.printUndefined = opts.printUndefined;
            var mycontext = new ContextMain;
            var mysandbox = _.extend({}, context.Context.sandbox, opts.sandbox || {}, {
                sh: myshell
            });
            mycontext.start(mysandbox);
            mycontext.exportMethodsAsGlobalVariables(mylib);
            opts.require.forEach(function (pkg) {
                mycontext.requirePackage(pkg.namespace, pkg.name);
            });
            myshell.setOptions(shell_opts).setLanguage(language).setParser(parser).setLib(mylib).bindConsole(myconsole).setContext(mycontext).registerActionClass("code", ActionCode).registerActionClass("exec", ActionExec).registerActionClass("exec_code", ActionExecCode).registerActionClass("stream", ActionStream).registerActionClass("respawn", ActionRespawn);
            callback(null, myshell);
        });
    };
    return Builder;
})();
exports.Builder = Builder;
