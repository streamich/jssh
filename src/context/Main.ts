/// <reference path="../typing.d.ts" />
import context = require("./context");
import vm = require("vm");


/**
 * Execute JS in the main context together with the rest of the code.
 */
export = ContextMain; class ContextMain extends context.Context implements context.IContext {

    /**
     * VM context.
     */
    ctx: any = global;

    start(sandbox) {
        super.start(sandbox);
        Object.keys(sandbox).forEach((prop) => {
            global[prop] = sandbox[prop];
        });
    }

    run(code) {
        return vm.runInThisContext(code);
        //return eval(code);
    }

}
