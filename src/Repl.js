var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="typing.d.ts" />
var events = require("events");
var prompt = require("./reader/prompt");
var LineBuffer = require("./LineBuffer");
var History = require("./History");
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
    Repl.build = function (sh, opts, terminal) {
        if (opts === void 0) { opts = {}; }
        if (terminal === void 0) { terminal = true; }
        var myreader = new prompt.Prompt(opts.prompt || null);
        myreader.init(sh.stdio.stdin, sh.stdio.stdout, terminal);
        var myrepl = new Repl(myreader);
        var myhistory = new History(opts.history);
        myrepl.setShell(sh).setHistory(myhistory);
        //.setConsole(sh.console);
        return myrepl;
    };
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
    //setConsole(console: Console) {
    //    this.console = console;
    //}
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
                this.shell.console.logFormatted(output);
            }
            this.loop();
            this.emit("eval", command, js, output);
        }.bind(this));
    };
    Repl.prototype.print = function (output) {
        this.shell.console.log(output);
    };
    Repl.prototype.printError = function (output) {
        this.shell.console.error(output);
    };
    Repl.prototype.loop = function () {
        // Reprint the first line on multiline-command start, to see properly line numbers.
        var buffered_lines = this.lineBuffer.lineCount();
        if (buffered_lines == 1) {
            var multiline_prompt = this.reader.templateMultiline.render({
                "{{BUFFERED_LINES}}": 0,
                "{{BUFFERED_LINES_+1}}": 1
            });
            this.shell.console.logSimple(multiline_prompt + this.lineBuffer.buffer[0] + this.lineBuffer.lastFoundSentinel);
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
        //this.shell.console.log("Exporting history to '" + file + "'.");
        //fs.writeFile(file, cmds.join(""));
        return cmds;
    };
    return Repl;
})(events.EventEmitter);
module.exports = Repl;
