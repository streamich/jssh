var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="./typing.d.ts" />
var events = require("events");
var host = require('./host/host');
var Shell = (function (_super) {
    __extends(Shell, _super);
    function Shell() {
        _super.apply(this, arguments);
        this.stdio = {
            stdin: process.stdin,
            stdout: process.stdout,
            stderr: process.stderr
        };
        // Used in `ActionExec`, experimental.
        this.shareStdio = true;
        this.hosts = new host.Collection;
        /**
         * Actions that this shell is able to execute.
         * @type {{}}
         */
        this.actions = {};
    }
    Shell.prototype.init = function () {
        var localhost = new host.HostLocalhost;
        this.hosts.add(localhost, true);
        return this;
    };
    Shell.prototype.setOptions = function (opts) {
        this.opts = opts;
        return this;
    };
    Shell.prototype.setLanguage = function (lang) {
        this.lang = lang;
        return this;
    };
    Shell.prototype.setParser = function (parser) {
        this.parser = parser;
        return this;
    };
    Shell.prototype.setLib = function (lib) {
        this.lib = lib;
        return this;
    };
    Shell.prototype.bindConsole = function (console) {
        this.console = console;
        console.sh = this;
        return this;
    };
    Shell.prototype.setContext = function (context) {
        this.context = context;
        return this;
    };
    Shell.prototype.registerActionClass = function (name, ActionClass) {
        this.actions[name] = ActionClass;
        return this;
    };
    Shell.prototype.createAction = function (name, payload) {
        var ActionClass = this.actions[name];
        // Or shall we throw here?
        if (!ActionClass)
            throw Error("action_not_registered");
        var action = new ActionClass;
        return action.setShell(this).setPayload(payload);
    };
    Shell.prototype.executeAction = function (name, payload, cb) {
        try {
            var myaction = this.createAction(name, payload);
        }
        catch (e) {
            if (e.message == "action_not_registered") {
                this.console.error("Action '" + name + "' not registered.");
                this.console.log(payload);
                cb(e);
                return null;
            }
            else
                throw e;
        }
        this.hosts.getActive().runAction(myaction, function (err, res) {
            cb(err, res, myaction.printOutput);
            // Emit "action" after `cb`, so that `history.last()` refers the previous action during this call.
            this.emit("action", myaction);
            this.emit("action:" + name, myaction);
        }.bind(this));
    };
    /**
     * @param command
     * @param cb
     * @returns {string} Compiled JS code.
     */
    Shell.prototype.eval = function (command, cb) {
        try {
            var ast = this.parser.parse(command); // Processed by peg.js, see "../grammar/default.peg" file.
        }
        catch (e) {
            this.console.logError("Grammar parse error.");
            this.console.logError(e);
        }
        this.console.verbose("Evaluating", ast);
        var payload = ast.payload;
        payload._raw = command; // Store raw command string, for displaying in history.
        var out = this.executeAction(ast.action, payload, cb);
        this.emit("eval", command);
        return out;
    };
    return Shell;
})(events.EventEmitter);
exports.Shell = Shell;
