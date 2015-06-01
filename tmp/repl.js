var net = require("net"),
    repl = require("repl"),
    stream = require("stream");


var Readable = require('stream').Readable;
var util = require('util');
util.inherits(Counter, Readable);

function Counter() {
    Readable.call(this);
}

a = {lalala: 123};

Counter.prototype._read = function() {
    var buf = new Buffer('a\n', 'ascii');
    this.push(buf);
    this.push(null);
};

var instream = new Counter;

repl.start({
    prompt: '',
    input: instream,
    //input: process.stdin,
    output: process.stdout,
    terminal: false,
    useColors: true,
    useGlobal: true
});
