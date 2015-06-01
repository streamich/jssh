/// <reference path="./typing.d.ts" />
var util = require('util');
var clc = require("cli-color");
var Console = (function () {
    function Console() {
        this.printUndefined = false;
        this.isVerbose = false;
        this.stdout = process.stdout;
        this.stderr = process.stderr;
        this.highlighter = function (msg) {
            return util.inspect(msg, {
                //showHidden: true,
                depth: 4,
                colors: true
            });
        };
    }
    Console.prototype.write = function (msg) {
        if (this.stdout)
            this.stdout.write("" + msg);
    };
    Console.prototype.writeError = function (msg) {
        if (this.stderr)
            this.stderr.write("" + msg);
    };
    Console.prototype.logSimple = function (msg) {
        this.write(msg + "\n");
    };
    Console.prototype.log = function (msg) {
        this.logHighlighted(msg);
    };
    Console.prototype.logError = function (msg) {
        this.logHighlighted(msg);
    };
    Console.prototype.error = function (msg) {
        this.logError(msg);
    };
    Console.prototype.highlight = function (msg) {
        return this.highlighter ? this.highlighter(msg) : msg;
    };
    Console.prototype.logHighlighted = function (msg) {
        this.logSimple(this.highlight(msg));
    };
    Console.prototype.logFormatted = function (msg) {
        if (msg instanceof Array) {
            this.logArray(msg);
        }
        else if (typeof msg == "object") {
            this.logObject(msg);
        }
        else {
            if (!this.printUndefined && (typeof msg == "undefined"))
                return; // Don't print undefined if .printUndefined = false
            else
                this.logHighlighted(msg);
        }
    };
    Console.prototype.verbose = function () {
        if (this.isVerbose)
            console.log.apply(console, arguments);
    };
    Console.prototype.logArray = function (arr) {
        if (arr[0]) {
            if ((arr[0] instanceof Array)) {
                var length = JSON.stringify(arr).length;
                if (length < 1000) {
                    this.logArrayAsTable(arr);
                    return;
                }
            }
            else {
                this.logObject(arr);
                return;
            }
        }
        this.logHighlighted(arr);
    };
    Console.prototype.logArrayAsTable = function (arr) {
        var AsciiTable = require("ascii-table");
        var table = new AsciiTable("");
        arr.forEach(function (row) {
            table.addRow.apply(table, row);
        });
        this.logSimple(table.toString());
    };
    Console.prototype.logObject = function (obj) {
        //var columnify = require('columnify');
        //this.logSimple(columnify(obj));
        this.logHighlighted(obj);
    };
    return Console;
})();
module.exports = Console;
