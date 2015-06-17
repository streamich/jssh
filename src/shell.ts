/// <reference path="./typing.d.ts" />
import events = require("events");
import stream = require("stream");
import api = require("./api");
import vm = require("vm");
import Language = require("./Language");
import Parser = require("./Parser");
import context = require("./context/context");
import Console = require("./Console");
import History = require("./History");
import Repl = require("./Repl");
import host = require('./host/host');


export interface IShellOptions {
    entrypoint: string[];           // Like ['/bin/sh', '-c']
}


export interface IStdIO {
    stdin;
    stdout;
    stderr;
}


export class Shell extends events.EventEmitter {

    opts: IShellOptions;

    /**
     * Global API that this shell exposes.
     */
    lib: api.Lib;

    lang: Language;

    parser: Parser;

    context: context.Context;

    stdio: IStdIO = {
        stdin: process.stdin,
        stdout: process.stdout,
        stderr: process.stderr,
    };

    // Used in `ActionExec`, experimental.
    shareStdio = true;

    console: Console;

    hosts: host.Collection = new host.Collection;

    /**
     * Actions that this shell is able to execute.
     * @type {{}}
     */
    actions: any = {};

    repl: Repl;

    init() {
        var localhost = new host.HostLocalhost;
        this.hosts.add(localhost, true);
        return this;
    }

    setOptions(opts: IShellOptions) {
        this.opts = opts;
        return this;
    }

    setLanguage(lang: Language) {
        this.lang = lang;
        return this;
    }

    setParser(parser: Parser) {
        this.parser = parser;
        return this;
    }

    setLib(lib: api.Lib) {
        this.lib = lib;
        return this;
    }

    bindConsole(console: Console) {
        this.console = console;
        console.sh = this;
        return this;
    }

    setContext(context: context.Context) {
        this.context = context;
        return this;
    }

    registerActionClass(name, ActionClass) {
        this.actions[name] = ActionClass;
        return this;
    }

    createAction(name, payload) {
        var ActionClass = this.actions[name];

        // Or shall we throw here?
        if(!ActionClass) throw Error("action_not_registered");

        var action = new ActionClass;
        return action
            .setShell(this)
            .setPayload(payload);
    }

    executeAction(name, payload, cb) {
        try {
            var myaction = this.createAction(name, payload);
        } catch(e) {
            if(e.message == "action_not_registered") {
                this.console.error("Action '" + name + "' not registered.");
                this.console.log(payload);
                cb(e);
                return null;
            } else throw e;
        }

        this.hosts.getActive().runAction(myaction, function(err, res) {
            cb(err, res, myaction.printOutput);

            // Emit "action" after `cb`, so that `history.last()` refers the previous action during this call.
            this.emit("action", myaction);
            this.emit("action:" + name, myaction);
        }.bind(this));
    }

    /**
     * @param command
     * @param cb
     * @returns {string} Compiled JS code.
     */
    eval(command: string, cb: (err?: any, out?: any, print?: boolean) => void): any {
        try {
            var ast = this.parser.parse(command); // Processed by peg.js, see "../grammar/default.peg" file.
        } catch(e) {
            this.console.logError("Grammar parse error.");
            this.console.logError(e);
        }
        this.console.verbose("Evaluating", ast);

        var payload = ast.payload;
        payload._raw = command; // Store raw command string, for displaying in history.

        var out = this.executeAction(ast.action, payload, cb);
        this.emit("eval", command);
        return out;
    }

}