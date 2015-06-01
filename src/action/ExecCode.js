var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var action = require("./action");
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
        var command = this.entrypoint[0];
        var args = this.entrypoint.slice(1);
        args.push("" + out);
        var cmd = spawn(command, args, {
            stdio: "inherit"
        });
        cmd.on("exit", function (code) {
            cb(null, code);
        });
        //var result = [];
        //cmd.stdout.on("data", function (data) {
        //    result.push(data);
        //    self.shell.console.write(data.toString());
        //});
        //
        //var error = [];
        //cmd.stderr.on("data", function (data) {
        //    error.push(data);
        //    self.shell.console.write(data.toString());
        //});
        //
        //cmd.on("close", (code) => {
        //    cb(error.length ? error.join("") : null, result.join(""));
        //});
        //cmd.on("error", (err) => {
        //    cb(err);
        //});
        return out;
    };
    return ActionExecCode;
})(action.Action);
module.exports = ActionExecCode;
