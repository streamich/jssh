import action = require("./action");


export = ActionCode; class ActionCode extends action.Action {

    name = "code";

    run(cb) {
        try {
            var shell = this.shell;
            var js_code = shell.lang.compile(this.payload.code);

            // TODO: normalize this across all languages.
            // CoffeeScript returns `undefined` on error.
            if ((shell.lang.name != "js") && (typeof js_code == "undefined")) {
                throw Error("invalid"); // Invalid syntax...
            }

            var out:any = shell.context.run(js_code);

            // If the result of the execution is a function, which is part of our API,
            // we execute it with no arguments. This allows us to be more like bash:
            // > ls
            // Instead of:
            // > ls()
            if (typeof out == "function") {
                if (out.__jssh_api) {
                    out = out.call(shell.context.ctx);
                }
            }

            this.setResult(out);
            process.nextTick(() => {
                cb(null, out);
            });

        } catch(e) {
            console.log(e);
            this.setError(e);
            process.nextTick(() => {
                cb(e);
            });
        }
    }

}