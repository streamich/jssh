/// <reference path="typing.d.ts" />
var Npm = (function () {
    function Npm() {
    }
    Npm.install = function (packages, cb) {
        var exec = require('child_process').exec;
        var cmd = 'npm install ' + packages.join(' ') + ' --no-bin-links --silent --spin=false';
        var options = { cwd: __dirname }; // Change directory, so the packages are installed in this module.
        exec(cmd, options, cb);
    };
    return Npm;
})();
module.exports = Npm;
