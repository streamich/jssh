import Reader = require("./Reader");
import stream = require("stream");
var lazy = require("lazy");


export = ReaderStream; class ReaderStream {

    stream;

    buffer: string[] = [];

    sep = "\n";

    done = false;

    error = null;

    setStream(stream) {
        this.stream = stream;
        return this;
    }

    start() {
        this.stream.on("end", this.onEnd.bind(this));
        this.stream.on("error", this.onError.bind(this));
        this.stream.on("data", this.onData.bind(this)); // When "data" event is attached, stream starts flowing.
    }

    private onData(chunk) {
        var lines = chunk.toString().split(this.sep);

        // If chunk ends with "\n", .split will produce empty string "", we can concatenate it with the
        // first line of the next chunk.
        if(this.buffer.length) {
            this.buffer[0] += lines.splice(0, 1);
        }

        this.buffer = this.buffer.concat(lines);
    }

    private onEnd() {
        this.done = true;
    }

    private popNextLine(cb) {
        var line = this.buffer.shift();
        line = line.replace(/^|([\r])+$/g, ''); // Remove any \r at the end of the line
        cb(null, line);
    }

    isFinished() {
        return this.done && !this.buffer.length;
    }

    readLine(cb) {
        if(this.error) {
            cb(this.error);
            return false;
        }

        if(this.buffer.length) { // Pop next line from the buffer.
            this.popNextLine(cb);
        } else {
            if(this.done) {
                cb();
                return false;
            } else {
                this.stream.once("data", function() {
                    process.nextTick(function() { this.readLine(cb); }.bind(this));
                }.bind(this));
            }
        }
        return true;
    }

    onError(error) {
        this.done = true;
        this.error = error;
    }

}