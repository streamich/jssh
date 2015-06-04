import action = require("./action");
import shell = require("../shell");
import child_process = require("child_process");


export = ActionExec; class ActionExec extends action.Action {

    static run(entrypoint, payload, sh: shell.Shell, cb) {
        var command = '', args = [];

        if(entrypoint) {
            command = entrypoint[0];
            args = entrypoint.slice(1);
            args.push(payload.command + " " + payload.arguments.join(" "));
        } else {
            command = payload.command;
            args = payload.arguments;
        }

        //if(sh.useStdio) {
            ActionExec.spawn(sh, command, args, cb);
        //} else {
        //    ActionExec.exec(command + ' ' + args.join(' '), cb);
        //}

    }

    static spawn(sh: shell.Shell, command: string, args: string[], cb: Icallback) {
        var options: any = {};
        if(sh.shareStdio) {
            // This line preserves console colors of the child process.
            // TODO: this is not an ideal solutions, because if `sh.stdio.stdout` is not
            // TODO: `process.stdout`, then when `.spawn` finishes, it calls the `.end()`
            // TODO: and the stream closes. For example, if it was a socket, it would close.
            // TODO: Need to program around the `.end()` event somehow.
            options.stdio = [sh.stdio.stdin, sh.stdio.stdout, sh.stdio.stderr];
        }

        var cmd = child_process.spawn(command, args, options);

        if(!sh.shareStdio) {
            cmd.stdout.pipe(sh.stdio.stdout, {end: false});
            cmd.stderr.pipe(sh.stdio.stderr, {end: false});
        }

        cmd.on("error", cb);
        cmd.on("exit", (code) => { cb(null, code); });
    }

    static exec(command: string, cb: Icallback) {
        child_process.exec(command, (err, stdout, stderr) => {
            var out = stdout.toString();
            if(stderr.length) out += "\n" + stderr.toString(); // TODO: Handle `stderr` somehow somehow better?
            cb(err, out);
        });
    }

    name = "exec";

    printOutput = false;

    run(cb) {
        ActionExec.run(this.shell.opts.entrypoint, this.payload, this.shell, cb);
    }

}