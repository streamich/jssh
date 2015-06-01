var pkg = '{{PACKAGE}}';
var ns = "{{NAMESPACE}}";
var GLOBAL = typeof global != "undefined" ? global : this;
GLOBAL[ns] = require(pkg);
