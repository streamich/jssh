import context = require("./context");
import vm = require("vm");


/**
 * Execute code in a separate context provided by `vm` module.
 */
export = ContextVm; class ContextVm extends context.Context implements context.IContext {

    /**
     * VM context.
     */
    ctx: any;

    start(sandbox) {
        super.start(sandbox);
        this.ctx = vm.createContext(this.sandbox);
    }

    run(code: string) {
        return vm.runInContext(code, this.ctx);
    }

}