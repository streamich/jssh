var pkg = '{{PACKAGE}}';
var ns = "{{NAMESPACE}}";
var GLOBAL = typeof global != "undefined" ? global : this;
var mod = require(pkg);
if(ns && (typeof GLOBAL[ns] == 'undefined')) GLOBAL[ns] = {};
var target = ns ? GLOBAL[ns] : GLOBAL;
for(var cmd in mod) {
var func = mod[cmd];
    func.__jssh_api = (ns ? ns + '.' : '') + cmd;
    target[cmd] = func;
}
