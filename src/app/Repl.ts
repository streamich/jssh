import builder = require("../builder");


export = AppRepl; class AppRepl {

    run(opts: builder.IOpts) {
        builder.Builder.buildRepl(opts, (err, repl) => {
            if(err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }
            repl.start();
        });
    }

}