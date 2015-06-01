var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var context = require("./context");
var vm = require("vm");
var ContextVm = (function (_super) {
    __extends(ContextVm, _super);
    function ContextVm() {
        _super.apply(this, arguments);
    }
    ContextVm.prototype.start = function (sandbox) {
        _super.prototype.start.call(this, sandbox);
        this.ctx = vm.createContext(this.sandbox);
    };
    ContextVm.prototype.run = function (code) {
        return vm.runInContext(code, this.ctx);
    };
    return ContextVm;
})(context.Context);
module.exports = ContextVm;
