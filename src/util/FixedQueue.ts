

/**
 * Fixed size queue.
 */
export = FixedQueue; class FixedQueue {

    queue = [];

    limit = 100;

    constructor(limit = 100) {
        this.limit = limit;
    }

    push(item) {
        this.queue.push(item);
        //if(this.queue.length > this.limit) this.queue.splice(0, 1);
    }

}