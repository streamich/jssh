import action = require("./action");


export = ActionExec; class ActionExec extends action.Action {

    name = "exec";

    printOutput = false;

    entrypoint = ["/bin/sh", "-c"];

    run(cb) {
        //var exec = require("child_process").exec;

        //var cmd = this.payload.command + " " + this.payload.arguments.join(" ");
        //exec(cmd, cb);

        var self = this;
        var spawn = require("child_process").spawn;

        var command = this.entrypoint[0];
        var args = this.entrypoint.slice(1);
        args.push(this.payload.command + " " + this.payload.arguments.join(" "));
        var cmd = spawn(command, args, {
            stdio: "inherit", // This line preserves console colors of the child process.
        });

        cmd.on("exit", (code) => {
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
    }

}