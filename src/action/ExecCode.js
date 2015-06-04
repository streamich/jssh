var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var action = require("./action");
var ActionExec = require("./Exec");
var ActionExecCode = (function (_super) {
    __extends(ActionExecCode, _super);
    function ActionExecCode() {
        _super.apply(this, arguments);
        this.name = "exec_code";
        this.printOutput = false;
        this.entrypoint = ["/bin/sh", "-c"];
    }
    // TODO: this code should better handle errors.
    // TODO: this function should be combined with `Exec.run()` and `Code.run()` in some common code.
    ActionExecCode.prototype.run = function (cb) {
        var self = this;
        var spawn = require("child_process").spawn;
        var shell = this.shell;
        var js_code = shell.lang.compile(this.payload.code);
        // TODO: normalize this across all languages.
        if ((shell.lang.name != "js") && (typeof js_code == "undefined")) {
            throw Error("invalid");
        }
        var out = shell.context.run(js_code);
        //console.log("Running", "" + out);
        this.runString("" + out, cb);
    };
    ActionExecCode.prototype.runString = function (str, cb) {
        // TODO: Clean this code, this is not nice.
        // TODO: Probably should have another loop through PEG.js
        var args = str.split(" ");
        var cmd = args.shift();
        var payload = {
            command: cmd,
            arguments: args
        };
        ActionExec.run(this.shell.opts.entrypoint, payload, this.shell, cb);
    };
    return ActionExecCode;
})(action.Action);
module.exports = ActionExecCode;
