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
    }
    ActionExec.run = function (entrypoint, payload, cb) {
        var child_process = require("child_process");
        var spawn = child_process.spawn;
        if (entrypoint) {
            var command = entrypoint[0];
            var args = entrypoint.slice(1);
            args.push(payload.command + " " + payload.arguments.join(" "));
            var cmd = spawn(command, args, {
                stdio: "inherit"
            });
            cmd.on("error", cb);
            cmd.on("exit", function (code) {
                cb(null, code);
            });
        }
        else {
            var cmd = spawn(payload.command, payload.arguments, {
                stdio: "inherit"
            });
            cmd.on("error", function (err) {
                //console.log(err);
                cb(err);
            });
            cmd.on("exit", function (code) {
                cb(null, code);
            });
        }
    };
    ActionExec.prototype.run = function (cb) {
        ActionExec.run(this.shell.opts.entrypoint, this.payload, cb);
    };
    return ActionExec;
})(action.Action);
module.exports = ActionExec;
