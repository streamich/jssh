/// <reference path="../typing.d.ts" />
import fs = require("fs");


export interface IContext {
    start(sandbox: any);
    stop();                 // Necessary for `contextify` package, to run `.dispose()` method.
    run(code: string);
}


/**
 * Context where the JS in the shell is executed.
 */
export class Context implements IContext {

    /**
     * Default startup object for the context.
     */
    static sandbox = {
        global: global,
        process: process,
        console: console,
        Buffer: Buffer,
        require: require,
        __filename: __filename,
        __dirname: process.cwd(), // TODO: Check is this is right.
        module: module,
        //exports: exports,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
    };

    /**
     * A .js template to `export` methods of a package as global functions.
     * @type {string}
     */
    static exportTemplate: string = fs.readFileSync(__dirname + "/tpl/export.js").toString();
    static requireTemplate: string = fs.readFileSync(__dirname + "/tpl/require.js").toString();

    sandbox: any = {};

    // TODO: This should be standardized across various contexts.
    // Context object, where the JS code is executed, can `.bind()` to it.
    ctx = null;

    start(sandbox) {
        this.sandbox = sandbox;
    }

    stop() {

    }

    run(code: string) {

    }

    /**
     * Here we expose methods of packages used as our API as global variables. So that you can do `ls`, `cd` and other
     * commands. For example, methods from package `shelljs` are exported: `shelljs.cd`, `shelljs.ls`, etc.., as global
     * variables, so in console one can do `ls` or `ls()`, or `cd('../my/path')`.
     */
    exportMethodsAsGlobalVariables(lib) {
        var self = this;
        lib.apis.forEach((api) => {
            var js = Context.exportTemplate
                .replace("{{PACKAGE}}", api.pkg)
                .replace("{{NAMESPACE}}", api.namespace ? api.namespace : "");
            self.run(js);
        });


        // TODO:...
        //var js = Context.exportTemplate
        //    .replace("{{PACKAGE}}", '../superprompt')
        //    .replace("{{NAMESPACE}}", "");
        //this.run(js);
    }

    requirePackage(namespace, name) {
        var js = Context.exportTemplate
            .replace("{{PACKAGE}}", name)
            .replace("{{NAMESPACE}}", namespace);
        this.run(js);
    }

}