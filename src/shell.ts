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


export interface IShellOptions {

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

    stdout = process.stdout;
    stderr = process.stderr;

    console: Console;

    /**
     * Actions that this shell is able to execute.
     * @type {{}}
     */
    actions: any = {};

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

    setConsole(console) {
        this.console = console;
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
            var action = this.createAction(name, payload);
        } catch(e) {
            if(e.message == "action_not_registered") {
                this.console.error("Action '" + name + "' not registered.");
                this.console.log(payload);
                cb(e);
                return null;
            } else throw e;
        }

        try {

            var out = action.run(function (err, res) {
                action.error = err;
                action.result = res;
                cb(err, res, action.printOutput);

                // Emit "action" after `cb`, so that `history.last()` refers the previous action during this call.
                this.emit("action", action);
                this.emit("action:" + name, action);
            }.bind(this));
            action.out = out;

            //this.console.log(out);
            return out;
        } catch(e) {
            this.console.error(e);
            action.error = e;

            if(e.message == "invalid") {
                // TODO: if code is invalid, execute `exec` action.
                // If something went wrong, maybe it is not JS, try to execute in system shell.
                // TODO: We should have an 'entry point` variable, such as '/bin/sh' or '/bin/bash' that we use to execute commands.
                cb();
                return null;
            }

            process.nextTick(() => { cb(e); });
            return null;
        }
    }

    /**
     * @param command
     * @param cb
     * @returns {string} Compiled JS code.
     */
    eval(command: string, cb: (err?: any, out?: any, print?: boolean) => void): any {
        var ast = this.parser.parse(command); // Processed by peg.js, see "../grammar/default.peg" file.
        this.console.verbose("Evaluating", ast);

        var payload = ast.payload;
        payload._raw = command; // Store raw command string, for displaying in history.

        var out = this.executeAction(ast.action, payload, cb);
        this.emit("eval", command);
        return out;
    }

}