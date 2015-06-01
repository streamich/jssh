var Reader = (function () {
    function Reader() {
    }
    Reader.prototype.setLineBuffer = function (buffer) {
        this.buffer = buffer;
        return this;
    };
    Reader.prototype.readLine = function () {
    };
    Reader.prototype.start = function () {
    };
    Reader.prototype.stop = function () {
    };
    return Reader;
})();
module.exports = Reader;
