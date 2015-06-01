import action = require("./action");


export = ActionStream; class ActionStream extends action.Action {

    name = "stream";

    run(cb) {
        this.shell.console.verbose("Stream:", this.payload);
        cb();
    }

}