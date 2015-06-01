var builder = require("../builder");
var path = require("path");
var fs = require("fs");
var ReaderStream = require("../reader/Stream");
var LineBuffer = require("../LineBuffer");
var AppScriptFile = (function () {
    function AppScriptFile() {
    }
    AppScriptFile.prototype.run = function (file, opts) {
        var filepath = path.resolve(file);
        //console.log(filepath);
        opts.sandbox = {
            __filename: filepath,
            __dirname: path.dirname(filepath)
        };
        builder.Builder.buildShell(opts, function (err, shell) {
            if (err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }
            var stream = fs.createReadStream(filepath);
            var reader = new ReaderStream;
            reader.setStream(stream).start();
            // Transforms multiple-lines into a complete command.
            // > apt-get install lib1 \
            //  lib2 \
            //  lib3 \
            //  etc...
            var linebuffer = new LineBuffer;
            linebuffer.onFlush = function (command) {
                console.log("command", command);
                console.log("command", JSON.stringify(command)); // TODO: NEED to remove \r
                shell.eval(command, function (err, out, print) {
                    if (err) {
                        console.log("Error when executing.");
                        console.log(err);
                        return;
                    }
                    if (print)
                        console.log(out);
                    read_loop();
                });
            };
            linebuffer.onBuffer = function () {
                read_loop();
            };
            var read_loop = function () {
                if (reader.isFinished()) {
                    return;
                }
                reader.readLine(function (err, line) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    linebuffer.consume(line);
                });
            };
            read_loop();
        });
    };
    return AppScriptFile;
})();
module.exports = AppScriptFile;
