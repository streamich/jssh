import LineBuffer = require("../LineBuffer");


/**
 * Abstract reader class.
 */
export = Reader; class Reader {

    buffer: LineBuffer;

    setLineBuffer(buffer: LineBuffer) {
        this.buffer = buffer;
        return this;
    }

    readLine() {

    }

    start() {

    }

    stop() {

    }

}