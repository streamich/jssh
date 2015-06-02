var AppSingleCommand = (function () {
    function AppSingleCommand(sh) {
        this.sh = sh;
    }
    AppSingleCommand.prototype.run = function (command, opts, cb) {
        this.sh.eval(command, function (err, out, print) {
            if (err) {
                console.log("Error when executing.");
                console.log(err);
                return;
            }
            if (print)
                console.log(out);
            cb();
        });
    };
    return AppSingleCommand;
})();
module.exports = AppSingleCommand;
