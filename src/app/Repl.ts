import builder = require("../builder");
import shell = require("../shell");


export = AppRepl; class AppRepl {

    sh: shell.Shell;

    constructor(sh: shell.Shell) {
        this.sh = sh;
    }

    run(opts: builder.IOpts) {
        var repl = builder.Builder.buildRepl(this.sh, opts);
        repl.start();
    }

}