var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typing.d.ts" />
var context = require("./context");
var vm = require("vm");
var ContextMain = (function (_super) {
    __extends(ContextMain, _super);
    function ContextMain() {
        _super.apply(this, arguments);
        /**
         * VM context.
         */
        this.ctx = global;
    }
    ContextMain.prototype.start = function (sandbox) {
        _super.prototype.start.call(this, sandbox);
        Object.keys(sandbox).forEach(function (prop) {
            global[prop] = sandbox[prop];
        });
    };
    ContextMain.prototype.run = function (code) {
        return vm.runInThisContext(code);
        //return eval(code);
    };
    return ContextMain;
})(context.Context);
module.exports = ContextMain;
