var Repl = require("../Repl");
var AppRepl = (function () {
    function AppRepl(sh) {
        this.sh = sh;
    }
    AppRepl.prototype.run = function (opts) {
        var repl = Repl.build(this.sh, opts);
        repl.start();
    };
    return AppRepl;
})();
module.exports = AppRepl;
