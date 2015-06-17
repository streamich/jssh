var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var action = require("./action");
var ActionCode = (function (_super) {
    __extends(ActionCode, _super);
    function ActionCode() {
        _super.apply(this, arguments);
        this.name = "code";
    }
    ActionCode.prototype.run = function (cb) {
        try {
            var shell = this.shell;
            var js_code = shell.lang.compile(this.payload.code);
            // TODO: normalize this across all languages.
            // CoffeeScript returns `undefined` on error.
            if ((shell.lang.name != "js") && (typeof js_code == "undefined")) {
                throw Error("invalid");
            }
            var out = shell.context.run(js_code);
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
            process.nextTick(function () {
                cb(null, out);
            });
        }
        catch (e) {
            console.log(e);
            this.setError(e);
            process.nextTick(function () {
                cb(e);
            });
        }
    };
    return ActionCode;
})(action.Action);
module.exports = ActionCode;
