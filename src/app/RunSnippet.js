var builder = require("../builder");
var path = require("path");
var AppSnippet = (function () {
    function AppSnippet() {
    }
    AppSnippet.prototype.run = function (file, opts) {
        var filepath = path.resolve(file);
        builder.Builder.buildShell(opts, function (err, shell) {
            if (err) {
                console.log("Error on startup.");
                console.log(err);
                return;
            }
            var js_require = "require(" + JSON.stringify(filepath) + ");";
            shell.context.run(js_require);
        });
    };
    return AppSnippet;
})();
module.exports = AppSnippet;
