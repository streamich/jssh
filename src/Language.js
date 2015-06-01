/// <reference path="typing.d.ts" />
var Language = (function () {
    function Language() {
        this.name = "js";
        this.compiler = null;
    }
    Language.loadLang = function (lang, cb) {
        var pkg = "jssh-lang-" + lang;
        try {
            cb(null, require(pkg));
        }
        catch (e) {
            if (e.code == "MODULE_NOT_FOUND") {
                require("./Npm").install(pkg, function (err, data) {
                    if (err)
                        return cb(err);
                    try {
                        cb(null, require(pkg));
                    }
                    catch (e) {
                        cb(e);
                    }
                });
            }
            else {
                cb(e);
            }
        }
    };
    Language.factory = function (name, cb) {
        Language.loadLang(name, function (err, compiler) {
            if (err)
                return cb(err);
            var lang = new Language;
            lang.name = name;
            lang.setCompiler(compiler);
            cb(null, lang);
        });
    };
    Language.prototype.setCompiler = function (compiler) {
        this.compiler = compiler;
        return compiler;
    };
    Language.prototype.compile = function (command) {
        return this.compiler(command);
    };
    return Language;
})();
module.exports = Language;
