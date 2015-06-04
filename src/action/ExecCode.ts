import action = require("./action");
import ActionExec = require("./Exec");


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
        this.runString("" + out, cb);
    }

    runString(str, cb) {
        // TODO: Clean this code, this is not nice.
        // TODO: Probably should have another loop through PEG.js
        var args = str.split(" ");
        var cmd = args.shift();
        var payload = {
            command: cmd,
            arguments: args,
        };
        ActionExec.run(this.shell.opts.entrypoint, payload, this.shell, cb);
    }

}