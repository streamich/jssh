import shell = require("../shell");


export interface IAction {

}


export class Action {

    /**
     * Action name for reference in `History` object.
     * @type {string}
     */
    name = "action";

    shell: shell.Shell = null;

    payload = null;

    // Results and errors of executing the action.
    error: any = null;
    result: any = null;
    out: any = null;

    printOutput = true;

    setShell(shell: shell.Shell) {
        this.shell = shell;
        return this;
    }

    setPayload(payload) {
        this.payload = payload;
        return this;
    }

    run(cb: Icallback) {

    }

    setResult(result: any) {
        this.result = result;
        return this;
    }

    setError(error: any) {
        this.error = error;
        return this;
    }

}