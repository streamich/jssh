var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var action = require("./action");
var child_process = require("child_process");
var ActionExec = (function (_super) {
    __extends(ActionExec, _super);
    function ActionExec() {
        _super.apply(this, arguments);
        this.name = "exec";
        this.printOutput = false;
    }
    ActionExec.run = function (entrypoint, payload, sh, cb) {
        var command = '', args = [];
        if (entrypoint) {
            command = entrypoint[0];
            args = entrypoint.slice(1);
            args.push(payload.command + " " + payload.arguments.join(" "));
        }
        else {
            command = payload.command;
            args = payload.arguments;
        }
        //if(sh.useStdio) {
        ActionExec.spawn(sh, command, args, cb);
        //} else {
        //    ActionExec.exec(command + ' ' + args.join(' '), cb);
        //}
    };
    ActionExec.spawn = function (sh, command, args, cb) {
        var options = {};
        if (sh.shareStdio) {
            // This line preserves console colors of the child process.
            // TODO: this is not an ideal solutions, because if `sh.stdio.stdout` is not
            // TODO: `process.stdout`, then when `.spawn` finishes, it calls the `.end()`
            // TODO: and the stream closes. For example, if it was a socket, it would close.
            // TODO: Need to program around the `.end()` event somehow.
            options.stdio = [sh.stdio.stdin, sh.stdio.stdout, sh.stdio.stderr];
        }
        var cmd = child_process.spawn(command, args, options);
        if (!sh.shareStdio) {
            cmd.stdout.pipe(sh.stdio.stdout, { end: false });
            cmd.stderr.pipe(sh.stdio.stderr, { end: false });
        }
        cmd.on("error", cb);
        cmd.on("exit", function (code) {
            cb(null, code);
        });
    };
    ActionExec.exec = function (command, cb) {
        child_process.exec(command, function (err, stdout, stderr) {
            var out = stdout.toString();
            if (stderr.length)
                out += "\n" + stderr.toString(); // TODO: Handle `stderr` somehow somehow better?
            cb(err, out);
        });
    };
    ActionExec.prototype.run = function (cb) {
        ActionExec.run(this.shell.opts.entrypoint, this.payload, this.shell, cb);
    };
    return ActionExec;
})(action.Action);
module.exports = ActionExec;
