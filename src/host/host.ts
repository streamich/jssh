import action = require('../action/action');


interface IHost {

    runAction(myaction: action.Action, cb: Icallback);

}


/**
 * A 'computer' where actions are executed, could be localhost, could be some other PC over SSH or some other
 * transport protocol.
 */
export class Host implements IHost {

    runAction(myaction: action.Action, cb: Icallback) {
        myaction.run(function (err, res) {
            cb(err, res, myaction.printOutput);
        }.bind(this));
    }
}


export class HostLocalhost extends Host {

    //runAction(myaction: action.Action, cb: Icallback) {
    //
    //}
}


export class Collection implements IHost {

    hosts: Host[] = [];

    // Currenctly active host.
    active: Host = null;

    add(host: Host, make_active = false) {
        this.hosts.push(host);
        if(make_active) {
            this.active = host;
        }
        return this;
    }

    getActive() {
        return this.active;
    }

    // Run an action on all hosts in this collection.
    runAction(myaction: action.Action, cb: Icallback) {

    }

    // Get a subset of hosts.
    filter(selector: any): Collection {
        var collection = new Collection;
        return collection;
    }
}
