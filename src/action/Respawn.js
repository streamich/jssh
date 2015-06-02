var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ActionExecCode = require("./ExecCode");
var ActionRespawn = (function (_super) {
    __extends(ActionRespawn, _super);
    function ActionRespawn() {
        _super.apply(this, arguments);
        this.name = "respawn";
    }
    ActionRespawn.prototype.run = function (cb) {
        this.runString(process.argv.join(" "), cb);
    };
    return ActionRespawn;
})(ActionExecCode);
module.exports = ActionRespawn;
