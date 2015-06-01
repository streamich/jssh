var FixedQueue = (function () {
    function FixedQueue(limit) {
        if (limit === void 0) { limit = 100; }
        this.queue = [];
        this.limit = 100;
        this.limit = limit;
    }
    FixedQueue.prototype.push = function (item) {
        this.queue.push(item);
        //if(this.queue.length > this.limit) this.queue.splice(0, 1);
    };
    return FixedQueue;
})();
module.exports = FixedQueue;
