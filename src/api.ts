/// <reference path="./typing.d.ts" />
var chalk = require("chalk");


export class Api {

    /**
     * Parse "ns:pkg" => {namespace: "ns", pkg: "pkg"}
     * @param name
     * @returns {any}
     */
    static parseNsPkg(name): {
        namespace: string;
        name: string;
    } {
        var tuple = name.split(":");
        if(tuple.length == 2) {
            return {
                namespace: tuple[0],
                name: tuple[1],
            };
        } else {
            return {
                namespace: null,
                name: name,
            };
        }
    }

    static factory(name) {
        var id = Api.parseNsPkg(name);
        var api = new Api(id.name, id.namespace);
        return api;
    }

    /**
     * Namespace user chooses for this package.
     * @type {null}
     */
    namespace: string = null;

    /**
     * `npm` package name.
     * @type {null}
     */
    pkg: string = null;

    module: any = null;

    constructor(pkg, ns = null) {
        this.pkg = pkg;
        this.namespace = ns;
    }

    name() {
        return (this.namespace ? this.namespace + ":" : "") + this.pkg;
    }

    requirePackage(cb) {

    }

    exists() {
        try {
            require(this.pkg);
            return true;
        } catch(e) {
            return false;
        }
    }

    requireOrInstallPackage(cb) {
        var self = this;
        var pkg = this.pkg;

        try {
            self.module = require(pkg);
            cb();
        } catch(e) {
            if(e.code == "MODULE_NOT_FOUND") {

                var pkg_name = chalk.cyan("`" + pkg + "`");
                //console.log("Package " + pkg_name + " not found. Trying to install it...");

                require("./Npm").install(pkg, (err, data) => {
                    if(err) return cb(err);
                    try {
                        self.module = require(pkg);
                        cb();
                    } catch(e) {
                        cb(e);
                    }
                });

            } else {
                cb(e);
            }
        }
    }

}

export interface IPackageNamespaced {
    namespace: string;
    name: string;
}


export class Lib {

    //libs = ["mecano", "shelljs", "util:jssh-api-util"];

    lib = {};

    apis: Api[] = [];

    build(apis: IPackageNamespaced[]) {
        var self = this;
        apis.forEach((pkg: IPackageNamespaced) => {
            var api = new Api(pkg.name, pkg.namespace);
            self.addApi(api);
        });
    }

    installIfMissing(cb) {
        try {
            this.apis.forEach((api) => {
                if(!api.exists()) throw '';
            });
            cb();
        } catch(e) {
            this.installAll(cb);
        }
    }

    installAll(cb) {
        var packages = [];
        this.apis.forEach((api) => {
            packages.push(api.pkg);
        });
        require('./Npm').install(packages, (err) => {
            console.log(err);
        });
    }

    load(apis: any[], cb) {
        var async = require("async");
        var self = this;

        var async_funcs = [];
        apis.forEach((pkg) => {
            async_funcs.push((cb) => {
                self.loadApi(pkg, cb);
            });
        });
        async.parallel(async_funcs, cb);
    }

    loadApi(pkg, cb) {
        var api = new Api(pkg.name, pkg.namespace);
        this.addApi(api);
        api.requireOrInstallPackage(cb);
    }

    addApi(api) {
        this.apis.push(api);
    }

    removeApi(name) {
        var api;
        for(var i = 0; i < this.apis.length; i++) {
            api = this.apis[i];
            if(api.name() == name) {
                return api.splice(i, 1);
            }
        }
    }

    flatten(ctx): any {
        var lib = {};
        var api, func;
        for(var i = 0; i < this.apis.length; i++) {
            api = this.apis[i];

            var ns = api.namespace ? {} : lib;

            for(var cmd in api.module) {
                func = api.module[cmd].bind(ctx);

                // Mark this function, so we know that we added it, and to be able to read its name later.
                func.__jssh_api = (api.namespace ? api.namespace + "." : "") + cmd;

                ns[cmd] = func;
            }

            if(api.namespace) lib[api.namespace] = ns;
        }
        this.lib = lib;
        return this;
    }

    cleanGlobal() {
        var lib = this.flatten();
        for(var cmd in lib) {
            if(global[cmd].__jssh_api) delete global[cmd];
        }
        return this;
    }

    exportToGlobal() {
        for(var cmd in this.lib) {
            global[cmd] = this.lib[cmd];
        }
        return this;
    }

}