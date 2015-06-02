var path = require("path");
var fs = require("fs");
var AppSnippet = (function () {
    function AppSnippet(sh) {
        this.sh = sh;
    }
    AppSnippet.prototype.run = function (file, opts) {
        var filepath = path.resolve(file);
        if (!fs.existsSync(filepath)) {
            if (fs.existsSync(filepath + "." + opts.language)) {
                filepath += "." + opts.language;
            }
            else {
                throw Error("File " + filepath + " does not exist.");
            }
        }
        var js_require = "require(" + JSON.stringify(filepath) + ");";
        this.sh.context.run(js_require);
        //var js = fs.readFileSync(filepath).toString();
        //if(js.substr(0, 2) == '#!') js = "//" + js;
        //this.sh.context.run(js);
    };
    return AppSnippet;
})();
module.exports = AppSnippet;
