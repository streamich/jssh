import builder = require("../builder");
import path = require("path");
import fs = require("fs");
import ReaderStream = require("../reader/Stream");
import LineBuffer = require("../LineBuffer");


/**
 * This app runs a script file, treating every line as a separate command.
 */
export = AppScriptFile; class AppScriptFile {

    run(file: string, opts: builder.IOpts) {
        var filepath = path.resolve(file);
        //console.log(filepath);

        opts.sandbox = {
            __filename: filepath,
            __dirname: path.dirname(filepath),
        };

        builder.Builder.buildShell(opts, (err, shell) => {
            if(err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }

            var stream = fs.createReadStream(filepath);
            var reader = new ReaderStream;
            reader
                .setStream(stream)
                .start();

            // Transforms multiple-lines into a complete command.
            // > apt-get install lib1 \
            //  lib2 \
            //  lib3 \
            //  etc...
            var linebuffer = new LineBuffer;
            linebuffer.onFlush = (command) => {
                console.log("command", command);
                console.log("command", JSON.stringify(command)); // TODO: NEED to remove \r
                shell.eval(command, (err, out, print) => {
                    if(err) {
                        console.log("Error when executing.");
                        console.log(err);
                        return;
                    }
                    if(print) console.log(out);
                    read_loop();
                });
            };
            linebuffer.onBuffer = () => {
                read_loop();
            };

            var read_loop = function() {
                if(reader.isFinished()) {
                    return;
                }

                reader.readLine((err, line) => {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    linebuffer.consume(line);
                });
            };

            read_loop();
        });
    }

}