import ActionExecCode = require("./ExecCode");


export = ActionRespawn; class ActionRespawn extends ActionExecCode {

    name = "respawn";

    run(cb) {
        this.runString(process.argv.join(" "), cb);
    }

}