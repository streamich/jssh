import builder = require("../builder");
import path = require("path");
import fs = require("fs");
import ReaderStream = require("../reader/Stream");
import LineBuffer = require("../LineBuffer");
import shell = require("../shell");


export = AppSnippet; class AppSnippet {

    sh: shell.Shell;

    constructor(sh: shell.Shell) {
        this.sh = sh;
    }

    run(file: string, opts: builder.IOpts) {
        var filepath = path.resolve(file);
        if(!fs.existsSync(filepath)) {
            if(fs.existsSync(filepath + "." + opts.language)) {
                filepath += "." + opts.language;
            } else {
                throw Error("File " + filepath + " does not exist.");
            }
        }

        var js_require = "require(" + JSON.stringify(filepath) + ");";
        this.sh.context.run(js_require);

        //var js = fs.readFileSync(filepath).toString();
        //if(js.substr(0, 2) == '#!') js = "//" + js;
        //this.sh.context.run(js);
    }

}