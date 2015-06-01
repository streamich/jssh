var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typing.d.ts" />
var context = require("./context");
var ContextProcess = (function (_super) {
    __extends(ContextProcess, _super);
    function ContextProcess() {
        _super.apply(this, arguments);
    }
    ContextProcess.prototype.start = function () {
    };
    ContextProcess.prototype.run = function (code) {
    };
    return ContextProcess;
})(context.Context);
module.exports = ContextProcess;
