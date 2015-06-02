/// <reference path="./typing.d.ts" />
var chalk = require("chalk");
var Api = (function () {
    function Api(pkg, ns) {
        if (ns === void 0) { ns = null; }
        /**
         * Namespace user chooses for this package.
         * @type {null}
         */
        this.namespace = null;
        /**
         * `npm` package name.
         * @type {null}
         */
        this.pkg = null;
        this.module = null;
        this.pkg = pkg;
        this.namespace = ns;
    }
    /**
     * Parse "ns:pkg" => {namespace: "ns", pkg: "pkg"}
     * @param name
     * @returns {any}
     */
    Api.parseNsPkg = function (name) {
        var tuple = name.split(":");
        if (tuple.length == 2) {
            return {
                namespace: tuple[0],
                name: tuple[1]
            };
        }
        else {
            return {
                namespace: null,
                name: name
            };
        }
    };
    Api.factory = function (name) {
        var id = Api.parseNsPkg(name);
        var api = new Api(id.name, id.namespace);
        return api;
    };
    Api.prototype.name = function () {
        return (this.namespace ? this.namespace + ":" : "") + this.pkg;
    };
    Api.prototype.requirePackage = function (cb) {
    };
    Api.prototype.exists = function () {
        try {
            require(this.pkg);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    Api.prototype.requireOrInstallPackage = function (cb) {
        var self = this;
        var pkg = this.pkg;
        try {
            self.module = require(pkg);
            cb();
        }
        catch (e) {
            if (e.code == "MODULE_NOT_FOUND") {
                var pkg_name = chalk.cyan("`" + pkg + "`");
                //console.log("Package " + pkg_name + " not found. Trying to install it...");
                require("./Npm").install(pkg, function (err, data) {
                    if (err)
                        return cb(err);
                    try {
                        self.module = require(pkg);
                        cb();
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
    return Api;
})();
exports.Api = Api;
var Lib = (function () {
    function Lib() {
        //libs = ["mecano", "shelljs", "util:jssh-api-util"];
        this.lib = {};
        this.apis = [];
    }
    Lib.prototype.build = function (apis) {
        var self = this;
        apis.forEach(function (pkg) {
            var api = new Api(pkg.name, pkg.namespace);
            self.addApi(api);
        });
    };
    Lib.prototype.installIfMissing = function (cb) {
        try {
            this.apis.forEach(function (api) {
                if (!api.exists())
                    throw '';
            });
            cb();
        }
        catch (e) {
            this.installAll(cb);
        }
    };
    Lib.prototype.installAll = function (cb) {
        var packages = [];
        this.apis.forEach(function (api) {
            packages.push(api.pkg);
        });
        require('./Npm').install(packages, function (err) {
            console.log(err);
        });
    };
    Lib.prototype.load = function (apis, cb) {
        var async = require("async");
        var self = this;
        var async_funcs = [];
        apis.forEach(function (pkg) {
            async_funcs.push(function (cb) {
                self.loadApi(pkg, cb);
            });
        });
        async.parallel(async_funcs, cb);
    };
    Lib.prototype.loadApi = function (pkg, cb) {
        var api = new Api(pkg.name, pkg.namespace);
        this.addApi(api);
        api.requireOrInstallPackage(cb);
    };
    Lib.prototype.addApi = function (api) {
        this.apis.push(api);
    };
    Lib.prototype.removeApi = function (name) {
        var api;
        for (var i = 0; i < this.apis.length; i++) {
            api = this.apis[i];
            if (api.name() == name) {
                return api.splice(i, 1);
            }
        }
    };
    Lib.prototype.flatten = function (ctx) {
        var lib = {};
        var api, func;
        for (var i = 0; i < this.apis.length; i++) {
            api = this.apis[i];
            var ns = api.namespace ? {} : lib;
            for (var cmd in api.module) {
                func = api.module[cmd].bind(ctx);
                // Mark this function, so we know that we added it, and to be able to read its name later.
                func.__jssh_api = (api.namespace ? api.namespace + "." : "") + cmd;
                ns[cmd] = func;
            }
            if (api.namespace)
                lib[api.namespace] = ns;
        }
        this.lib = lib;
        return this;
    };
    Lib.prototype.cleanGlobal = function () {
        var lib = this.flatten();
        for (var cmd in lib) {
            if (global[cmd].__jssh_api)
                delete global[cmd];
        }
        return this;
    };
    Lib.prototype.exportToGlobal = function () {
        for (var cmd in this.lib) {
            global[cmd] = this.lib[cmd];
        }
        return this;
    };
    return Lib;
})();
exports.Lib = Lib;
