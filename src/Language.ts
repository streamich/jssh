/// <reference path="typing.d.ts" />

require("jssh-lang-js")
//require("jssh-lang-coffee")

// Wrapper around .js or one of JavaScripts dialets (.coffee, etc..).
export = Language; class Language {

    static loadLang(lang, cb) {
        var pkg = "jssh-lang-" + lang;
        try {
            cb(null, require("jssh-lang-" + lang));
        } catch(e) {
            if(e.code == "MODULE_NOT_FOUND") {
                require("./Npm").install(pkg, (err, data) => {
                    if(err) return cb(err);
                    try {
                        cb(null, require("jssh-lang-" + lang));
                    } catch(e) {
                        cb(e);
                    }
                });
            } else {
                cb(e);
            }
        }
    }

    static factory(name, cb) {
        Language.loadLang(name, (err, compiler) => {
            if(err) return cb(err);

            var lang = new Language;
            lang.name = name;
            lang.setCompiler(compiler);
            cb(null, lang);
        });
    }

    name = "js";

    compiler = null;

    setCompiler(compiler) {
        this.compiler = compiler;
        return compiler;
    }

    compile(command) {
        return this.compiler(command);
    }

}