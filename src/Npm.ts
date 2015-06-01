/// <reference path="typing.d.ts" />
var npm = require("npm");


export = Npm; class Npm {

    // This script returns an `npm` object.
    static loaded = false;
    static get(cb) {
        if(Npm.loaded) {
            cb(null, npm);
        } else {
            var config = {
                spin: false,
            };
            npm.load(config, (err) => {
                if(err) return cb(err);

                // Prevent `npm` from displaying anything.
                // Imagine you use `jssh` for piping some output using STDIN, you don't want anything
                // to mess with your stream.
                npm.spinner.start = function() {};
                npm.spinner.stop = function() {};
                npm.registry.log.level = "silent";
                npm.registry.log.pause();
                npm.registry.log.disableProgress();
                npm.registry.log.log = function() {};

                Npm.loaded = true;
                cb(null, npm);
            });
        }
    }

    //static install(pkg, cb) {
    //    Npm.get((err, npm) => {
    //        if(err) return cb(err);
    //        npm.commands.install([pkg], cb);
    //    });
    //}

    static install(packages: string[], cb: Icallback) {
        var exec = require('child_process').exec;

        var cmd = 'npm install ' + packages.join(' ') + ' --no-bin-links --silent --spin=false';
        var options = {cwd: __dirname}; // Change directory, so the packages are installed in this module.

        exec(cmd, options, cb);
    }

}