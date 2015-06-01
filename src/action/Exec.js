var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var action = require("./action");
var ActionExec = (function (_super) {
    __extends(ActionExec, _super);
    function ActionExec() {
        _super.apply(this, arguments);
        this.name = "exec";
        this.printOutput = false;
        this.entrypoint = ["/bin/sh", "-c"];
    }
    ActionExec.prototype.run = function (cb) {
        //var exec = require("child_process").exec;
        //var cmd = this.payload.command + " " + this.payload.arguments.join(" ");
        //exec(cmd, cb);
        var self = this;
        var spawn = require("child_process").spawn;
        var command = this.entrypoint[0];
        var args = this.entrypoint.slice(1);
        args.push(this.payload.command + " " + this.payload.arguments.join(" "));
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
        //    console.log('.\n\n\n\n..', 'finish\n\n\ed');
        //    error.push(data);
        //    self.shell.console.write(data.toString());
        //});
        //
        //cmd.on("close", (code) => {
        //    console.log('.\n\n\n\n..', 'finish\n\n\ed');
        //    cb(error.length ? error.join("") : null, result.join(""));
        //});
        //cmd.on("error", (err) => {
        //    console.log('..\n\n\n.', 'finish\n\n\n\nned errr');
        //    cb(err);
        //});
    };
    return ActionExec;
})(action.Action);
module.exports = ActionExec;
