var lazy = require("lazy");
var ReaderStream = (function () {
    function ReaderStream() {
        this.buffer = [];
        this.sep = "\n";
        this.done = false;
        this.error = null;
    }
    ReaderStream.prototype.setStream = function (stream) {
        this.stream = stream;
        return this;
    };
    ReaderStream.prototype.start = function () {
        this.stream.on("end", this.onEnd.bind(this));
        this.stream.on("error", this.onError.bind(this));
        this.stream.on("data", this.onData.bind(this)); // When "data" event is attached, stream starts flowing.
    };
    ReaderStream.prototype.onData = function (chunk) {
        var lines = chunk.toString().split(this.sep);
        // If chunk ends with "\n", .split will produce empty string "", we can concatenate it with the
        // first line of the next chunk.
        if (this.buffer.length) {
            this.buffer[0] += lines.splice(0, 1);
        }
        this.buffer = this.buffer.concat(lines);
    };
    ReaderStream.prototype.onEnd = function () {
        this.done = true;
    };
    ReaderStream.prototype.popNextLine = function (cb) {
        var line = this.buffer.shift();
        line = line.replace(/^|([\r])+$/g, ''); // Remove any \r at the end of the line
        cb(null, line);
    };
    ReaderStream.prototype.isFinished = function () {
        return this.done && !this.buffer.length;
    };
    ReaderStream.prototype.readLine = function (cb) {
        if (this.error) {
            cb(this.error);
            return false;
        }
        if (this.buffer.length) {
            this.popNextLine(cb);
        }
        else {
            if (this.done) {
                cb();
                return false;
            }
            else {
                this.stream.once("data", function () {
                    process.nextTick(function () {
                        this.readLine(cb);
                    }.bind(this));
                }.bind(this));
            }
        }
        return true;
    };
    ReaderStream.prototype.onError = function (error) {
        this.done = true;
        this.error = error;
    };
    return ReaderStream;
})();
module.exports = ReaderStream;
