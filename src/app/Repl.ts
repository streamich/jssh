import builder = require("../builder");
import shell = require("../shell");
import Repl = require("../Repl");


export = AppRepl; class AppRepl {

    sh: shell.Shell;

    constructor(sh: shell.Shell) {
        this.sh = sh;
    }

    run(opts: builder.IOpts) {
        var repl = Repl.build(this.sh, opts);
        repl.start();
    }

}