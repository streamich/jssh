import builder = require("../builder");
import shell = require("../shell");


/**
 * This app executes a single command provided by `-c` argument.
 */
export = AppSingleCommand; class AppSingleCommand {

    sh: shell.Shell;

    constructor(sh: shell.Shell) {
        this.sh = sh;
    }

    run(command: string, opts: builder.IOpts, cb) {
        this.sh.eval(command, (err, out, print) => {
            if(err) {
                console.log("Error when executing.");
                console.log(err);
                return;
            }
            if(print) console.log(out);
            cb();
        });
    }

}