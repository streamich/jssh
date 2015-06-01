var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="typing.d.ts" />
var events = require("events");
var LineBuffer = require("./LineBuffer");
var Repl = (function (_super) {
    __extends(Repl, _super);
    function Repl(reader) {
        _super.call(this);
        this.console = console;
        this.lineBuffer = new LineBuffer;
        this.lineBuffer.onFlush = this.read.bind(this);
        this.lineBuffer.onBuffer = this.loop.bind(this);
        this.reader = reader;
        reader.setRepl(this);
        reader.setLineBuffer(this.lineBuffer);
    }
    Repl.prototype.setShell = function (shell) {
        this.shell = shell;
        return this;
    };
    Repl.prototype.setHistory = function (history) {
        this.history = history;
        this.shell.on("action", function (action) {
            history.push(action);
        });
        return this;
    };
    Repl.prototype.setConsole = function (console) {
        this.console = console;
    };
    Repl.prototype.read = function (command) {
        if (command)
            this.eval(command.replace(/^\s+|\s+$/g, '')); // .replace() == .trim()
        else
            this.loop();
    };
    Repl.prototype.eval = function (command) {
        var js = this.shell.eval(command, function (err, output, print) {
            if (print === void 0) { print = true; }
            if (print) {
                this.console.logFormatted(output);
            }
            this.loop();
            this.emit("eval", command, js, output);
        }.bind(this));
    };
    Repl.prototype.print = function (output) {
        this.console.log(output);
    };
    Repl.prototype.printError = function (output) {
        this.console.error(output);
    };
    Repl.prototype.loop = function () {
        // Reprint the first line on multiline-command start, to see properly line numbers.
        var buffered_lines = this.lineBuffer.lineCount();
        if (buffered_lines == 1) {
            var multiline_prompt = this.reader.templateMultiline.render({
                "{{BUFFERED_LINES}}": 0,
                "{{BUFFERED_LINES_+1}}": 1
            });
            this.console.logSimple(multiline_prompt + this.lineBuffer.buffer[0] + this.lineBuffer.lastFoundSentinel);
        }
        this.reader.readLine();
        this.emit("loop");
    };
    Repl.prototype.start = function () {
        this.loop();
        this.emit("start");
    };
    Repl.prototype.stop = function () {
        this.reader.stop();
        this.emit("stop");
    };
    Repl.prototype.exportHistory = function (sentinel) {
        //var fs = require("fs");
        //var path = require("path");
        //
        //var ext = path.extname(file);
        //if(!ext) file += ".sh." + this.shell.lang.name;
        if (sentinel === void 0) { sentinel = "//"; }
        var cmds = [];
        this.history.queue.queue.forEach(function (action) {
            var command = action.payload._raw;
            command = command.replace("\n", sentinel + "\n");
            cmds.push(command);
        });
        //this.console.log("Exporting history to '" + file + "'.");
        //fs.writeFile(file, cmds.join(""));
        return cmds;
    };
    return Repl;
})(events.EventEmitter);
module.exports = Repl;
