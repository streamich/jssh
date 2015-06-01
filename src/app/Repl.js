var builder = require("../builder");
var AppRepl = (function () {
    function AppRepl() {
    }
    AppRepl.prototype.run = function (opts) {
        builder.Builder.buildRepl(opts, function (err, repl) {
            if (err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }
            repl.start();
        });
    };
    return AppRepl;
})();
module.exports = AppRepl;
