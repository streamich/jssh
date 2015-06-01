import builder = require("../builder");


/**
 * This app executes a single command provided by `-c` argument.
 */
export = AppSingleCommand; class AppSingleCommand {

    run(command: string, opts: builder.IOpts) {
        builder.Builder.buildShell(opts, (err, shell) => {
            if(err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }
            shell.eval(command, (err, out, print) => {
                if(err) {
                    console.log("Error when executing.");
                    console.log(err);
                    return;
                }
                if(print) console.log(out);
            });
        });
    }

}