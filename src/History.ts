import FixedQueue = require("./util/FixedQueue");


export = History; class History {

    queue: FixedQueue;

    constructor(limit = 100) {
        this.queue = new FixedQueue(limit);
    }

    push(item) {
        this.queue.push(item);
    }

    get(index) {
        var arr = this.queue.queue;
        var len = arr.length;
        return arr[len - Math.abs(index)];
    }

    last() {
        return this.get(1);
    }

}