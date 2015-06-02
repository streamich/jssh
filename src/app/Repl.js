var builder = require("../builder");
var AppRepl = (function () {
    function AppRepl(sh) {
        this.sh = sh;
    }
    AppRepl.prototype.run = function (opts) {
        var repl = builder.Builder.buildRepl(this.sh, opts);
        repl.start();
    };
    return AppRepl;
})();
module.exports = AppRepl;
