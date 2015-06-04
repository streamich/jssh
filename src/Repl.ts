/// <reference path="typing.d.ts" />
import events = require("events");
import prompt = require("./reader/prompt");
import shell = require("./shell");
import LineBuffer = require("./LineBuffer");
import Console = require("./Console");
import History = require("./History");


/**
 * REPL loop -- read, eval, print, loop
 */
export = Repl; class Repl extends events.EventEmitter {

    static build(sh: shell.Shell, opts: any = {}, terminal = true) {
        var myreader = new prompt.Prompt(opts.prompt || null);
        myreader.init(sh.stdio.stdin, sh.stdio.stdout, terminal);

        var myrepl = new Repl(myreader);
        var myhistory = new History(opts.history);

        myrepl
            .setShell(sh)
            .setHistory(myhistory);
            //.setConsole(sh.console);

        return myrepl;
    }

    shell: shell.Shell;

    reader: prompt.Prompt;

    console: any = console;

    lineBuffer: LineBuffer;

    // TODO: History should be attached to REPL instead.
    history: History;

    constructor(reader: prompt.Prompt) {
        super();

        this.lineBuffer = new LineBuffer;
        this.lineBuffer.onFlush = this.read.bind(this);
        this.lineBuffer.onBuffer = this.loop.bind(this);

        this.reader = reader;
        reader.setRepl(this);
        reader.setLineBuffer(this.lineBuffer);
    }

    setShell(shell: shell.Shell) {
        this.shell = shell;
        return this;
    }

    setHistory(history: History) {
        this.history = history;
        this.shell.on("action", (action) => { history.push(action); });
        return this;
    }

    //setConsole(console: Console) {
    //    this.console = console;
    //}

    read(command: string) {
        if(command) this.eval(command.replace(/^\s+|\s+$/g, '')); // .replace() == .trim()
        else this.loop();
    }

    eval(command: string) {
        var js = this.shell.eval(command, function(err, output, print = true) {
            if(print) {
                this.shell.console.logFormatted(output);
            }
            this.loop();
            this.emit("eval", command, js, output);
        }.bind(this));

    }

    print(output: any) {
        this.shell.console.log(output);
    }

    printError(output: any) {
        this.shell.console.error(output);
    }

    loop() {

        // Reprint the first line on multiline-command start, to see properly line numbers.
        var buffered_lines = this.lineBuffer.lineCount();
        if(buffered_lines == 1) {
            var multiline_prompt = this.reader.templateMultiline.render({
                "{{BUFFERED_LINES}}":       0,
                "{{BUFFERED_LINES_+1}}":    1,
            });
            this.shell.console.logSimple(multiline_prompt + this.lineBuffer.buffer[0] + this.lineBuffer.lastFoundSentinel);
        }

        this.reader.readLine();
        this.emit("loop");
    }

    start() {
        this.loop();
        this.emit("start");
    }

    stop() {
        this.reader.stop();
        this.emit("stop");
    }

    exportHistory(sentinel = "//") {
        //var fs = require("fs");
        //var path = require("path");
        //
        //var ext = path.extname(file);
        //if(!ext) file += ".sh." + this.shell.lang.name;

        var cmds = [];
        this.history.queue.queue.forEach((action) => {
            var command = action.payload._raw;
            command = command.replace("\n", sentinel + "\n");
            cmds.push(command);
        });

        //this.shell.console.log("Exporting history to '" + file + "'.");
        //fs.writeFile(file, cmds.join(""));
        return cmds;
    }

}