var FixedQueue = require("./util/FixedQueue");
var History = (function () {
    function History(limit) {
        if (limit === void 0) { limit = 100; }
        this.queue = new FixedQueue(limit);
    }
    History.prototype.push = function (item) {
        this.queue.push(item);
    };
    History.prototype.get = function (index) {
        var arr = this.queue.queue;
        var len = arr.length;
        return arr[len - Math.abs(index)];
    };
    History.prototype.last = function () {
        return this.get(1);
    };
    return History;
})();
module.exports = History;
