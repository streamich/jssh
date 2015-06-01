var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var context = require("./context");
var contextify = require("contextify");
var ContextContextify = (function (_super) {
    __extends(ContextContextify, _super);
    function ContextContextify() {
        _super.apply(this, arguments);
    }
    return ContextContextify;
})(context.Context);
module.exports = ContextContextify;
