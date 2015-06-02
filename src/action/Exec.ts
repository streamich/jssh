import action = require("./action");


export = ActionExec; class ActionExec extends action.Action {

    static run(entrypoint, payload, cb) {
        var child_process = require("child_process");
        var spawn = child_process.spawn;

        if(entrypoint) {
            var command = entrypoint[0];
            var args = entrypoint.slice(1);
            args.push(payload.command + " " + payload.arguments.join(" "));
            var cmd = spawn(command, args, {
                stdio: "inherit", // This line preserves console colors of the child process.
            });
            cmd.on("error", cb);
            cmd.on("exit", (code) => {
                cb(null, code);
            });
        } else {

            var cmd = spawn(payload.command, payload.arguments, {
                stdio: "inherit", // This line preserves console colors of the child process.
            });
            cmd.on("error", (err) => {
                //console.log(err);
                cb(err);
            });
            cmd.on("exit", (code) => {
                cb(null, code);
            });
        }
    }

    name = "exec";

    printOutput = false;

    run(cb) {
        ActionExec.run(this.shell.opts.entrypoint, this.payload, cb);
    }

}