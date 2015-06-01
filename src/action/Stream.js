var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var action = require("./action");
var ActionStream = (function (_super) {
    __extends(ActionStream, _super);
    function ActionStream() {
        _super.apply(this, arguments);
        this.name = "stream";
    }
    ActionStream.prototype.run = function (cb) {
        this.shell.console.verbose("Stream:", this.payload);
        cb();
    };
    return ActionStream;
})(action.Action);
module.exports = ActionStream;
