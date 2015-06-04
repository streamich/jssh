/// <reference path="./../typing.d.ts" />
import Reader = require("./Reader");
import Repl = require("../Repl");
import path = require("path");
import readline = require("readline");
import LineBuffer = require("../LineBuffer");
var chalk = require("chalk");
var manifest = require("../manifest");
var _ = require("lodash");

declare var ls: any;


var colors = ['cyan', 'green', 'red', 'yellow', 'magenta'];
var color1 = colors[Math.floor(Math.random() * colors.length)];
var color2 = colors[Math.floor(Math.random() * colors.length)];
var color3 = colors[Math.floor(Math.random() * colors.length)];
var color4 = colors[Math.floor(Math.random() * colors.length)];
var color5 = colors[Math.floor(Math.random() * colors.length)];
var color6 = colors[Math.floor(Math.random() * colors.length)];

export class Template {

    static template = function(self: Template) {
        var tpl =
            chalk[color1].bold(manifest.name) +
            ":" +
            chalk[color2].bold("{{USER}}") +
            "@" +
            chalk[color3].bold("{{HOSTNAME_SHORT}}") +
            chalk[color4].bold("{{CWD_SHORT}}") +
            "." +
            chalk[color5].bold("{{LANG_SHORT}}") +
            "#" +
            chalk[color6].bold("{{CNT}}") +
            ";" +
            chalk[color1].dim("{{HOURS}}{{MINUTES}}{{SECONDS}} ");

        // Favorite
        //tpl = "\u250C " +
        //    chalk.white.bold("#{{CNT}}") +
        //    "" +
        //    chalk.white.dim("[{{HOURS}}{{MINUTES}}:{{SECONDS}}]") +
        //    "" +
        //    chalk.cyan.bold(manifest.name) +
        //    ":" +
        //    chalk.red.bold("{{USER}}") +
        //    "@" +
        //    chalk.green.bold("{{HOSTNAME_SHORT}}") +
        //    chalk.yellow.bold("{{CWD}}") +
        //    " " +
        //    chalk.magenta.bold("({{LANG}})") +
        //    "\n\u2514 ";
        //console.log(JSON.stringify(tpl));

        var prompt = self.interpolate(tpl);
        //console.log(JSON.stringify(prompt));
        return prompt;
        //return clc.red((new Array(60 + 1)).join("/"));
    };

    /**
     * Prompt template.
     * @type {() => string}
     */
    //template: string|((prompt: Prompt) => string) = function() { return "> "; };
    template: any = function() { return " > "; };

    /**
     * We need a reference to shell here, to populate template variables.
     */
    prompt: Prompt;

    startTime: number;

    interpolateCounter: number = 0;

    /**
     * Static variables that we interpolate prompt with, the ones that don't change with time.
     * @type {{}}
     */
    variablesStatic: any = null;

    preferredPathSep = "/";


    constructor(tpl: string) {
        this.setTemplate(tpl);
        this.resetTime();
    }

    resetTime() {
        this.startTime = +new Date();
        return this;
    }

    setTemplate(tpl: any) {
        this.template = tpl;
        return this;
    }

    setPrompt(prompt: Prompt) {
        this.prompt = prompt;
        return this;
    }

    /**
     * Template variables that do not change on every command, we generate them once.
     */
    generateStaticVariables() {
        // HOSTNAME
        var hostname = require("os").hostname();

        var user = process.env.USER;
        if(!user) {
            var userprofile = process.env.USERPROFILE;          // Windows
            if(!userprofile) userprofile = process.env.HOME;    // Ubuntu
            if(userprofile) {
                user = userprofile.substr(userprofile.lastIndexOf(path.sep) + 1);
            } else {
                user = "";
            }
        }

        return this.variablesStatic = {
            "{{HOSTNAME}}":         hostname,
            "{{HOSTNAME_SHORT}}":   hostname > 8 ? hostname.substr(0, 3) + ".." + hostname.substr(hostname.length - 3) : hostname,
            "{{USER}}":             user ? user : "",
            "{{LANG}}":             this.prompt.repl.shell.lang.name,
            "{{LANG_SHORT}}":       this.prompt.repl.shell.lang.name.substr(0, 3),
        };
    }

    getStaticVariables() {
        var vars = this.variablesStatic;
        return vars ? vars : this.generateStaticVariables();
    }

    generateDynamicVariables() {

        // Counter of number of times prompt has been interpolated = is roughly equal to
        // the number of executed commands.
        this.interpolateCounter++;
        var cnt = "" + this.interpolateCounter;
        if(this.interpolateCounter > 500) {
            cnt = (Math.round(this.interpolateCounter / 1e2) / 10) + "K";
            if(cnt[0] == "0") cnt = cnt.substr(1);
        }

        var time = Math.floor((+new Date() - this.startTime) / 1e3);
        var hours = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours * 60)) / 60);
        var seconds = time - (minutes * 60) + (hours * 3600);
        var str_hours = "";
        if(hours) {
            str_hours = hours > 9 ? "" + hours : "0" + hours;
        }
        var str_minutes = minutes > 9 ? "" + minutes : "0" + minutes;
        var str_seconds = seconds > 9 ? "" + seconds : "0" + seconds;

        // CWD
        var cwd = process.cwd();
        var parts = cwd.split(path.sep);

        // Remove the colon from 'c:' -> 'c' from Windows drives.
        var drive = parts[0];
        var drive_step = "";
        if(drive) {
            var drive_parts = drive.match(/^([a-z]+):$/i);
            if(drive_parts.length > 1) drive_step = this.preferredPathSep + drive_parts[1].toLowerCase();
        }
        parts[0] = drive_step;

        cwd = parts.join(this.preferredPathSep);
        var cwd_short = cwd;

        if(cwd.length > 10) {
            var len = parts.length;
            if(len > 3) {
                var skipped = len - 3;
                if(skipped < 6) {
                    var gap = new Array(skipped + 1).join(".");
                } else {
                    var gap = "..[" + skipped + "]..";
                }
                cwd_short = drive_step + this.preferredPathSep +
                    parts[1] + this.preferredPathSep +
                    gap + this.preferredPathSep +
                    parts[len - 1];
            }
        }

        var buffered_lines = this.prompt.repl.lineBuffer.lineCount();

        return {
            "{{CNT}}":                  cnt,
            "{{TIME}}":                 time,
            "{{HOURS}}":                str_hours,
            "{{MINUTES}}":              str_minutes,
            "{{SECONDS}}":              str_seconds,
            "{{CWD}}":                  cwd,
            "{{CWD_SHORT}}":            cwd_short,
            "{{BUFFERED_LINES}}":       buffered_lines,
            "{{BUFFERED_LINES_+1}}":    buffered_lines + 1,
        };
    }

    variables() {
        return _.extend({}, this.getStaticVariables(), this.generateDynamicVariables());
    }

    interpolate(tpl, params = {}) {
        var variables = _.extend(this.variables(), params);
        for (var v in variables) {
            tpl = tpl.replace(v, variables[v]);
        }
        return tpl;
    }

    render(params = {}) {
        var tpl = this.template;
        if(typeof tpl == "function") return tpl(this);
        else return this.interpolate(tpl, params);
    }

}

// https://github.com/joyent/node/issues/3860
//readline.Interface.prototype.setPrompt = function(prompt, length) {
//    this._prompt = prompt;
//    if (length) {
//        this._promptLength = length;
//    } else {
//        var lines = prompt.split(/[\r\n]/);
//        var lastLine = lines[lines.length - 1];
//        this._promptLength = lastLine.replace(/\u001b\[(\d+(;\d+)*)?m/g, '').length;
//    }
//};


export class Prompt extends Reader {

    /**
     * We need a reference to REPL here, to populate template variables.
     */
    repl: Repl;

    readline: readline.ReadLine;

    template: Template;

    templateMultiline: Template;

    buffer: LineBuffer;

    constructor(tpl: any, tpl_multiline: any = chalk.magenta("{{BUFFERED_LINES_+1}}  ")) {
        super();
        this.setTemplate(tpl);
        this.setMultilineTemplate(tpl_multiline);

        // `readline` module does not parse out color info when setting prompt length, resulting in
        // extra spaces. Here we fix that.
        //var set_prompt = this.readline.setPrompt.bind(this.readline);
        //this.readline.setPrompt = function(prompt, length) {
        //    var stripcolorcodes = require("stripcolorcodes");
            //console.log(JSON.stringify(prompt));
            //console.log(JSON.stringify(stripcolorcodes(prompt)));
            //set_prompt(prompt, stripcolorcodes(prompt).length);
        //};
    }

    setLineBuffer(buffer: LineBuffer) {
        this.buffer = buffer;
        return this;
    }

    init(stdin = process.stdin, stdout = process.stdout, terminal = true) {

        stdin.isTTY = true;
        stdout.isTTY = true;

        var rl = this.readline = readline.createInterface({
            input: stdin,
            output: stdout,
            terminal: true,
            completer: (line) => {

                var clean_line = line.replace(/([^a-z0-9_])/ig, ' ').trim();

                // TODO: Everything we are doing here implies that the code executed by the user
                // TODO: runs in global context. E.g. (1) we check `global`; (2) we rely on `ls()` command.

                var results = [];
                var last_word = clean_line; // Last word separated by space.

                if(clean_line.indexOf(' ') == -1) { // No spaces -> check for global functions.
                    for(var cmd in global) {
                        if(cmd.match(new RegExp(clean_line))) {
                            results.push(cmd);
                        }
                    }
                } else {
                    last_word = clean_line.substr(clean_line.lastIndexOf(' ') + 1);
                }

                results.sort();

                if(typeof ls == 'function') { // Check `ls` command is available, it might be not.
                    var files = ls(last_word + "*");
                    if(files.length) results = results.concat(files);
                }

                return [results, line];
            }
        });
        rl.on('close', () => {
            console.log(''); // Otherwise parent console is on the same line.
        });
    }

    readLine() {
        var buffer = this.buffer;
        //if(!this.readline) this.init();

        // Show different prompt, if we are receiving multi line command.
        var prompt = buffer.lineCount() ? this.templateMultiline.render() : this.template.render();
        var self = this;
        var rl = this.readline.question(prompt, function(line) {
            self.readline.pause(); // This line allows us to launch another `jssh` instance from this one `> jssh`.
            buffer.consume(line);
        });
    }

    setTemplate(tpl: Template|any) {
        if(!(tpl instanceof Template)) tpl = new Template(tpl);
        tpl.setPrompt(this);
        this.template = tpl;
        return this;
    }

    setMultilineTemplate(tpl: Template|any) {
        if(!(tpl instanceof Template)) tpl = new Template(tpl);
        tpl.setPrompt(this);
        this.templateMultiline = tpl;
        return this;
    }

    setRepl(repl: Repl) {
        this.repl = repl;
        return this;
    }

    stop() {
        this.readline.close();
    }

}