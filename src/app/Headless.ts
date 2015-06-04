import builder = require("../builder");
import shell = require("../shell");
import ReaderStream = require("../reader/Stream");
import LineBuffer = require("../LineBuffer");
import prompt = require("../reader/prompt");
import History = require("../History");
import util = require("util");


/**
 * Run `jssh` in pure STDIO mode: it will listen to STDIN, and reply through STDOUT and STDERR,
 * without any interactive console things.
 *
 * When `jssh` runs in `--socket` mode, it creates a new `AppHeadless` for every socket connection.
 */
export = AppHeadless; class AppHeadless {

    sh: shell.Shell;

    reader;

    lineBuffer;

    constructor(sh: shell.Shell) {
        this.sh = sh;
    }

    run() {
        // Proxy STDIO events from `ExecAction` to shell.
        this.sh.shareStdio = true;

        this.reader = new ReaderStream;
        this.reader
            .setStream(this.sh.stdio.stdin)
            .start();

        this.lineBuffer = new LineBuffer;
        this.lineBuffer.onFlush = this.onBufferFlush.bind(this);
        this.lineBuffer.onBuffer = this.readMore.bind(this);

        // Start reading from the stream.
        this.readMore();

        process.on("message", this.onMessage.bind(this));
    }

    onMessage(m) {
        console.log("received fork msg", m);
    }

    readMore() {
        if(this.reader.isFinished()) {
            return;
        }

        this.reader.readLine((err, line) => {
            if(err) {
                console.log(err);
                return;
            }
            this.lineBuffer.consume(line);
        });
    }

    onBufferFlush(command) {
        this.evalCommand(command, function() {
            this.readMore();
        }.bind(this));
    }

    evalCommand(command, cb) {
        command = command.trim();
        if(!command) cb();

        this.sh.eval(command, function(err, out, print) {
            if(err) {
                this.log("Error");
                this.log(err);
            }
            //if(print) {
            this.log(out);
            //}
            cb();
        }.bind(this));
    }

    log(msg) {
        msg = "" + util.inspect(msg);
        this.sh.console.write(msg + "\n");
    }

}
