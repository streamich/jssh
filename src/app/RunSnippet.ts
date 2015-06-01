import builder = require("../builder");
import path = require("path");
import fs = require("fs");
import ReaderStream = require("../reader/Stream");
import LineBuffer = require("../LineBuffer");
import shell = require("../shell");


export = AppSnippet; class AppSnippet {

    run(file: string, opts: builder.IOpts) {
        var filepath = path.resolve(file);

        builder.Builder.buildShell(opts, (err, shell: shell.Shell) => {
            if(err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }

            var js_require = "require(" + JSON.stringify(filepath) + ");";
            shell.context.run(js_require);
        });
    }

}