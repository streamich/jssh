import action = require("./action");


export = ActionCode; class ActionCode extends action.Action {

    name = "code";

    run(cb) {
        var shell = this.shell;
        var js_code = shell.lang.compile(this.payload.code);

        // TODO: normalize this across all languages.
        if((shell.lang.name != "js") && (typeof js_code == "undefined")) { // CoffeeScript returns `undefined` on error.
            throw Error("invalid"); // Invalid syntax...
        }

        var out: any = shell.context.run(js_code);

        // If the result of the execution is a function, which is part of our API,
        // we execute it with no arguments. This allows us to be more like bash:
        // > ls
        // Instead of:
        // > ls()
        if(typeof out == "function") {
            if(out.__jssh_api) {
                // TODO: this should be called in the right context.
                //out = out.call(this.context);
                out = out.call(shell.context.ctx);
                //out = out();
            }
        }

        process.nextTick(() => { cb(null, out); });
        return out;
    }

}