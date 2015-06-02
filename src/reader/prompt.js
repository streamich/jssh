var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="./../typing.d.ts" />
var Reader = require("./Reader");
var path = require("path");
var readline = require("readline");
var chalk = require("chalk");
var manifest = require("../manifest");
var _ = require("lodash");
var Template = (function () {
    function Template(tpl) {
        /**
         * Prompt template.
         * @type {() => string}
         */
        //template: string|((prompt: Prompt) => string) = function() { return "> "; };
        this.template = function () {
            return " > ";
        };
        this.interpolateCounter = 0;
        /**
         * Static variables that we interpolate prompt with, the ones that don't change with time.
         * @type {{}}
         */
        this.variablesStatic = null;
        this.preferredPathSep = "/";
        this.setTemplate(tpl);
        this.resetTime();
    }
    Template.prototype.resetTime = function () {
        this.startTime = +new Date();
        return this;
    };
    Template.prototype.setTemplate = function (tpl) {
        this.template = tpl;
        return this;
    };
    Template.prototype.setPrompt = function (prompt) {
        this.prompt = prompt;
        return this;
    };
    /**
     * Template variables that do not change on every command, we generate them once.
     */
    Template.prototype.generateStaticVariables = function () {
        // HOSTNAME
        var hostname = require("os").hostname();
        var user = process.env.USER;
        if (!user) {
            var userprofile = process.env.USERPROFILE; // Windows
            if (!userprofile)
                userprofile = process.env.HOME; // Ubuntu
            if (userprofile) {
                user = userprofile.substr(userprofile.lastIndexOf(path.sep) + 1);
            }
            else {
                user = "";
            }
        }
        return this.variablesStatic = {
            "{{HOSTNAME}}": hostname,
            "{{HOSTNAME_SHORT}}": hostname > 8 ? hostname.substr(0, 3) + ".." + hostname.substr(hostname.length - 3) : hostname,
            "{{USER}}": user ? user : "",
            "{{LANG}}": this.prompt.repl.shell.lang.name,
            "{{LANG_SHORT}}": this.prompt.repl.shell.lang.name.substr(0, 3)
        };
    };
    Template.prototype.getStaticVariables = function () {
        var vars = this.variablesStatic;
        return vars ? vars : this.generateStaticVariables();
    };
    Template.prototype.generateDynamicVariables = function () {
        // Counter of number of times prompt has been interpolated = is roughly equal to
        // the number of executed commands.
        this.interpolateCounter++;
        var cnt = "" + this.interpolateCounter;
        if (this.interpolateCounter > 500) {
            cnt = (Math.round(this.interpolateCounter / 1e2) / 10) + "K";
            if (cnt[0] == "0")
                cnt = cnt.substr(1);
        }
        var time = Math.floor((+new Date() - this.startTime) / 1e3);
        var hours = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours * 60)) / 60);
        var seconds = time - (minutes * 60) + (hours * 3600);
        var str_hours = "";
        if (hours) {
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
        if (drive) {
            var drive_parts = drive.match(/^([a-z]+):$/i);
            if (drive_parts.length > 1)
                drive_step = this.preferredPathSep + drive_parts[1].toLowerCase();
        }
        parts[0] = drive_step;
        cwd = parts.join(this.preferredPathSep);
        var cwd_short = cwd;
        if (cwd.length > 10) {
            var len = parts.length;
            if (len > 3) {
                var skipped = len - 3;
                if (skipped < 6) {
                    var gap = new Array(skipped + 1).join(".");
                }
                else {
                    var gap = "..[" + skipped + "]..";
                }
                cwd_short = drive_step + this.preferredPathSep + parts[1] + this.preferredPathSep + gap + this.preferredPathSep + parts[len - 1];
            }
        }
        var buffered_lines = this.prompt.repl.lineBuffer.lineCount();
        return {
            "{{CNT}}": cnt,
            "{{TIME}}": time,
            "{{HOURS}}": str_hours,
            "{{MINUTES}}": str_minutes,
            "{{SECONDS}}": str_seconds,
            "{{CWD}}": cwd,
            "{{CWD_SHORT}}": cwd_short,
            "{{BUFFERED_LINES}}": buffered_lines,
            "{{BUFFERED_LINES_+1}}": buffered_lines + 1
        };
    };
    Template.prototype.variables = function () {
        return _.extend({}, this.getStaticVariables(), this.generateDynamicVariables());
    };
    Template.prototype.interpolate = function (tpl, params) {
        if (params === void 0) { params = {}; }
        var variables = _.extend(this.variables(), params);
        for (var v in variables) {
            tpl = tpl.replace(v, variables[v]);
        }
        return tpl;
    };
    Template.prototype.render = function (params) {
        if (params === void 0) { params = {}; }
        var tpl = this.template;
        if (typeof tpl == "function")
            return tpl(this);
        else
            return this.interpolate(tpl, params);
    };
    Template.template = function (self) {
        var tpl = chalk.cyan.bold(manifest.name) + ":" + chalk.green("{{USER}}") + "@" + chalk.red("{{HOSTNAME_SHORT}}") + chalk.yellow("{{CWD_SHORT}}") + "." + chalk.magenta("{{LANG_SHORT}}") + "#" + chalk.cyan("{{CNT}}") + ";" + chalk.cyan.dim("{{HOURS}}{{MINUTES}}{{SECONDS}} ");
        var prompt = self.interpolate(tpl);
        //console.log(JSON.stringify(prompt));
        return prompt;
        //return clc.red((new Array(60 + 1)).join("/"));
    };
    return Template;
})();
exports.Template = Template;
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
var Prompt = (function (_super) {
    __extends(Prompt, _super);
    function Prompt(tpl, tpl_multiline) {
        if (tpl_multiline === void 0) { tpl_multiline = chalk.magenta("{{BUFFERED_LINES_+1}}  "); }
        _super.call(this);
        this.setTemplate(tpl);
        this.setMultilineTemplate(tpl_multiline);
        this.init();
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
    Prompt.prototype.setLineBuffer = function (buffer) {
        this.buffer = buffer;
        return this;
    };
    Prompt.prototype.init = function () {
        var rl = this.readline = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true,
            completer: function (line) {
                var clean_line = line.replace(/([^a-z0-9_])/ig, ' ').trim();
                // TODO: Everything we are doing here implies that the code executed by the user
                // TODO: runs in global context. E.g. (1) we check `global`; (2) we rely on `ls()` command.
                var results = [];
                var last_word = clean_line; // Last word separated by space.
                if (clean_line.indexOf(' ') == -1) {
                    for (var cmd in global) {
                        if (cmd.match(new RegExp(clean_line))) {
                            results.push(cmd);
                        }
                    }
                }
                else {
                    last_word = clean_line.substr(clean_line.lastIndexOf(' ') + 1);
                }
                results.sort();
                if (typeof ls == 'function') {
                    var files = ls(last_word + "*");
                    if (files.length)
                        results = results.concat(files);
                }
                return [results, line];
            }
        });
    };
    Prompt.prototype.readLine = function () {
        var buffer = this.buffer;
        //if(!this.readline) this.init();
        // Show different prompt, if we are receiving multi line command.
        var prompt = buffer.lineCount() ? this.templateMultiline.render() : this.template.render();
        this.readline.question(prompt, buffer.consume.bind(buffer));
    };
    Prompt.prototype.setTemplate = function (tpl) {
        if (!(tpl instanceof Template))
            tpl = new Template(tpl);
        tpl.setPrompt(this);
        this.template = tpl;
        return this;
    };
    Prompt.prototype.setMultilineTemplate = function (tpl) {
        if (!(tpl instanceof Template))
            tpl = new Template(tpl);
        tpl.setPrompt(this);
        this.templateMultiline = tpl;
        return this;
    };
    Prompt.prototype.setRepl = function (repl) {
        this.repl = repl;
        return this;
    };
    Prompt.prototype.stop = function () {
        this.readline.close();
    };
    return Prompt;
})(Reader);
exports.Prompt = Prompt;
