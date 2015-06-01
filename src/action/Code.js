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
        var shell = this.shell;
        var js_code = shell.lang.compile(this.payload.code);
        // TODO: normalize this across all languages.
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
                // TODO: this should be called in the right context.
                //out = out.call(this.context);
                out = out.call(shell.context.ctx);
            }
        }
        process.nextTick(function () {
            cb(null, out);
        });
        return out;
    };
    return ActionCode;
})(action.Action);
module.exports = ActionCode;
