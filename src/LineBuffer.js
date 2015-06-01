var LineBuffer = (function () {
    function LineBuffer() {
        /**
         * Characters that indicate that command does not finish, escapes `\n`.
         * @type {string[]}
         */
        this.concatenateSentinels = ["//", "\\"]; // \ - standard; // - experimental.
        /**
         * String with which lines are concatenated.
         * @type {string}
         */
        this.concatenateString = "\n";
        /**
         * Buffer of a command if line ends with '.concatenateSentinels()' we replace with `.concatenateString` and
         * concatenate it with the next line.
         * @type {string}
         */
        this.buffer = [];
        this.lastFoundSentinel = "";
    }
    /**
     * Check if line ends with concatenation symbol.
     * @param line
     * @returns {number} Length of the last chars to replace with "\n".
     */
    LineBuffer.prototype.foundSentinelLength = function (line) {
        var len = line.length, sentinel, slen;
        for (var i = 0; i < this.concatenateSentinels.length; i++) {
            sentinel = this.concatenateSentinels[i];
            var slen = sentinel.length;
            if (sentinel == line.substr(len - slen)) {
                this.lastFoundSentinel = sentinel;
                return slen;
            }
        }
        return 0;
    };
    /**
     * @param line
     * @returns {boolean} Return command if to be executed, "" if buffered.
     */
    LineBuffer.prototype.consume = function (line) {
        var sentinel_len = this.foundSentinelLength(line); // Line ends with '\' or '//'.
        if (sentinel_len) {
            this.buffer.push(line.substr(0, line.length - sentinel_len));
            this.onBuffer();
        }
        else
            this.flush(line);
    };
    LineBuffer.prototype.flush = function (end) {
        if (end)
            this.buffer.push(end);
        var command = this.buffer.join(this.concatenateString);
        this.buffer = [];
        this.onFlush(command);
    };
    LineBuffer.prototype.lineCount = function () {
        return this.buffer.length;
    };
    return LineBuffer;
})();
module.exports = LineBuffer;
