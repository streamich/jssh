var ReaderStream = require("../reader/Stream");
var LineBuffer = require("../LineBuffer");
var util = require("util");
var AppHeadless = (function () {
    function AppHeadless(sh) {
        this.sh = sh;
    }
    AppHeadless.prototype.run = function () {
        // Proxy STDIO events from `ExecAction` to shell.
        this.sh.shareStdio = true;
        this.reader = new ReaderStream;
        this.reader.setStream(this.sh.stdio.stdin).start();
        this.lineBuffer = new LineBuffer;
        this.lineBuffer.onFlush = this.onBufferFlush.bind(this);
        this.lineBuffer.onBuffer = this.readMore.bind(this);
        // Start reading from the stream.
        this.readMore();
        process.on("message", this.onMessage.bind(this));
    };
    AppHeadless.prototype.onMessage = function (m) {
        console.log("received fork msg", m);
    };
    AppHeadless.prototype.readMore = function () {
        var _this = this;
        if (this.reader.isFinished()) {
            return;
        }
        this.reader.readLine(function (err, line) {
            if (err) {
                console.log(err);
                return;
            }
            _this.lineBuffer.consume(line);
        });
    };
    AppHeadless.prototype.onBufferFlush = function (command) {
        this.evalCommand(command, function () {
            this.readMore();
        }.bind(this));
    };
    AppHeadless.prototype.evalCommand = function (command, cb) {
        command = command.trim();
        if (!command)
            cb();
        this.sh.eval(command, function (err, out, print) {
            if (err) {
                this.log("Error");
                this.log(err);
            }
            //if(print) {
            this.log(out);
            //}
            cb();
        }.bind(this));
    };
    AppHeadless.prototype.log = function (msg) {
        msg = "" + util.inspect(msg);
        this.sh.console.write(msg + "\n");
    };
    return AppHeadless;
})();
module.exports = AppHeadless;
