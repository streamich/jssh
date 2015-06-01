var builder = require("../builder");
var AppSingleCommand = (function () {
    function AppSingleCommand() {
    }
    AppSingleCommand.prototype.run = function (command, opts) {
        builder.Builder.buildShell(opts, function (err, shell) {
            if (err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }
            shell.eval(command, function (err, out, print) {
                if (err) {
                    console.log("Error when executing.");
                    console.log(err);
                    return;
                }
                if (print)
                    console.log(out);
            });
        });
    };
    return AppSingleCommand;
})();
module.exports = AppSingleCommand;
