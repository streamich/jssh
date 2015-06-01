import action = require("./action");


/**
 * First evaluate the code, then execute the resulting string as a shell command.
 */
export = ActionExecCode; class ActionExecCode extends action.Action {

    name = "exec_code";

    printOutput = false;

    entrypoint = ["/bin/sh", "-c"];

    // TODO: this code should better handle errors.
    // TODO: this function should be combined with `Exec.run()` and `Code.run()` in some common code.
    run(cb) {
        var self = this;
        var spawn = require("child_process").spawn;
        var shell = this.shell;
        var js_code = shell.lang.compile(this.payload.code);

        // TODO: normalize this across all languages.
        if((shell.lang.name != "js") && (typeof js_code == "undefined")) { // CoffeeScript returns `undefined` on error.
            throw Error("invalid"); // Invalid syntax...
        }

        var out: any = shell.context.run(js_code);
        //console.log("Running", "" + out);

        var command = this.entrypoint[0];
        var args = this.entrypoint.slice(1);
        args.push("" + out);
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
    }

}