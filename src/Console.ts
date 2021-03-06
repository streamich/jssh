/// <reference path="./typing.d.ts" />
import util = require('util');
import shell = require('./shell');


interface IConsole {
    log(...args: any[]);
    verbose(...args: any[]);
}


export = Console; class Console implements IConsole {

    printUndefined = false;

    isVerbose = false;

    sh: shell.Shell;

    highlighter = function(msg) {
        return util.inspect(msg, {
            //showHidden: true,
            depth: 4,
            colors: true,
        });
    };

    write(msg) {
        if(this.sh.stdio.stdout) this.sh.stdio.stdout.write("" + msg);
    }

    writeError(msg) {
        if(this.sh.stdio.stderr) this.sh.stdio.stderr.write("" + msg);
    }

    logSimple(msg) {
        this.write(msg + "\n");
    }

    log(msg) {
        this.logHighlighted(msg);
    }

    logError(msg) {
        this.logHighlighted(msg);
    }

    error(msg) {
        this.logError(msg);
    }

    highlight(msg) {
        return this.highlighter ? this.highlighter(msg) : msg;
    }

    logHighlighted(msg) {
        if(typeof msg == "string") {
            this.logSimple(msg);
        } else {
            this.logSimple(this.highlight(msg));
        }
    }

    logFormatted(msg) {
        if(msg instanceof Array) {
            this.logArray(msg);
        } else if(typeof msg == "object") {
            this.logObject(msg);
        } else {
            if(!this.printUndefined && (typeof msg == "undefined")) return; // Don't print undefined if .printUndefined = false
            else this.logHighlighted(msg);
        }
    }

    verbose(...args: any[]);
    verbose() {
        if(this.isVerbose) console.log.apply(console, arguments);
    }

    logArray(arr) {
        if(arr[0]) {
            if((arr[0] instanceof Array)) {
                var length = JSON.stringify(arr).length;
                if (length < 1000) {
                    this.logArrayAsTable(arr);
                    return;
                }
            } else {
                this.logObject(arr);
                return;
            }
        }
        this.logHighlighted(arr);
    }

    logArrayAsTable(arr) {
        var AsciiTable = require("ascii-table");
        var table = new AsciiTable("");
        arr.forEach((row) => { table.addRow.apply(table, row); });
        this.logSimple(table.toString())
    }

    logObject(obj) {
        //var columnify = require('columnify');
        //this.logSimple(columnify(obj));
        this.logHighlighted(obj);
    }

}