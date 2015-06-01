/// <reference path="../typing.d.ts" />
var fs = require("fs");
/**
 * Context where the JS in the shell is executed.
 */
var Context = (function () {
    function Context() {
        this.sandbox = {};
        // TODO: This should be standardized across various contexts.
        // Context object, where the JS code is executed, can `.bind()` to it.
        this.ctx = null;
    }
    Context.prototype.start = function (sandbox) {
        this.sandbox = sandbox;
    };
    Context.prototype.stop = function () {
    };
    Context.prototype.run = function (code) {
    };
    /**
     * Here we expose methods of packages used as our API as global variables. So that you can do `ls`, `cd` and other
     * commands. For example, methods from package `shelljs` are exported: `shelljs.cd`, `shelljs.ls`, etc.., as global
     * variables, so in console one can do `ls` or `ls()`, or `cd('../my/path')`.
     */
    Context.prototype.exportMethodsAsGlobalVariables = function (lib) {
        var self = this;
        lib.apis.forEach(function (api) {
            var js = Context.exportTemplate.replace("{{PACKAGE}}", api.pkg).replace("{{NAMESPACE}}", api.namespace ? api.namespace : "");
            self.run(js);
        });
    };
    Context.prototype.requirePackage = function (namespace, name) {
        var js = Context.exportTemplate.replace("{{PACKAGE}}", name).replace("{{NAMESPACE}}", namespace);
        this.run(js);
    };
    /**
     * Default startup object for the context.
     */
    Context.sandbox = {
        global: global,
        process: process,
        console: console,
        Buffer: Buffer,
        require: require,
        __filename: __filename,
        __dirname: process.cwd(),
        module: module,
        //exports: exports,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
    };
    /**
     * A .js template to `export` methods of a package as global functions.
     * @type {string}
     */
    Context.exportTemplate = fs.readFileSync(__dirname + "/tpl/export.js").toString();
    Context.requireTemplate = fs.readFileSync(__dirname + "/tpl/require.js").toString();
    return Context;
})();
exports.Context = Context;
