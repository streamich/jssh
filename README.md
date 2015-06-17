# JavaScript Shell

A shell in *JavaScript*, use *JavaScript* instead of BASH for your shell and scripts.

**This project is under development in very early alpha. Use at your own risk. Many parts of this project will change
in the future.**

## Installation

Install as a global `npm` package.

    npm install -g jssh
    
Or,

    sudo npm install -g jssh
    
Or use a *portable* version: `./portable/jssh.js`. This file is a bundle of everything `jssh` needs to run.
 
## Use with Node OS

An simple way how to install `jssh` on [Node OS](https://node-os.com/):

    mkdir /usr/test
    cd /usr/test
    node
    
    var fs = require('fs');
    var https = require('https');
    https.get('https://raw.githubusercontent.com/streamich/jssh/master/portable/jssh-big.js', function(res) { var data = ''; res.on('data', function(chunk) { data += chunk.toString(); }); res.on('end', function() { fs.writeFileSync('./jssh.js', data); }); });
  
  
  
## Usage

Once installed, to start the shell in REPL mode, just type `jssh` in your console.

    jssh
    
Execute arbitrary *JavaScript*.

    1 + 1
    2
    
    typeof require
    function
    
Execute built-in global functions, `jssh` exposes a number of global functions to work with your machine. In particular,
by default it uses functions [`jssh-api-jssh`](http://npmjs.com/package/jssh-api-jssh), which internally uses
[`shelljs`](http://npmjs.com/package/shelljs) package for Unix-like shell commands.
 
    ls()
    ls // Evaluates global functions automatically.
    
Note that `ls` returns the same results as `ls()`, that is because `jssh` executes automatically a functions if that is part
of the *API*, see below on API.

Get the first file in current directory:

    ls()[0]

To execute shell commands start with `>` symbol. This way your commands will be 'proxied' to the native system shell
defined by the `entrypoint` property in the configuration file.

    > ls
    > whoami
    root
    
Alternatively you can use `#!` or `//>` (instead of `>`) to execute shell commands. Advantage of using `//>` is that 
`//` starts a comment, which makes your command a valid *JavaScript* code. (Use `#!` for *CoffeScript*. Yes, you can
use *CoffeeScript* or any language that compiles to *JavaScript*, read below.) 

    //> ifconfig
    #! ping google.com -c 1

You can also execute commands interactively -- first the code is evaluated to a string and then proxied to your system 
shell. To execute your command interactively use `$` symbol like so: `$>`, `//$>`, `#$>`, or `#!$`.

    $> "p" + "w" + "d"
    
    var is_windows = !!process.env.WINDIR;
    $> is_windows ? "ipconfig" : "ifconfig";
    
Or simply use a predefined *JavaScript* function `$` provided by the `jssh-api-jssh` API (see below on APIs).

    $('pwd')

Number directories with indices (*jssh* displays nested arrays as tables):

    [_.map(ls(), function(dir, i) { return i; }), ls()]

Get command help.

    help(ls)
    help(cd)
    help(<command>)
    
`help` command pretty-prints help information stored with the commands available through `.help()` method. Get the raw
*Markdown* help calling it directly `ln.help()`.
    
`jssh` uses `//` syntax at the end of line to indicate that the code will continue on the next line. *This is an experimental
feature.* A benefit is that the *JavaScript* code is still valid even with these comment marks at the end of line. (`\`
works as well.)
 
    if(true) { //
        console.log("multiline code"); //
    }
    multiline code
    
**TODO: Update this...**
Get the history of your commands using `jssh.exportHistory()` method.

    ls
    //> ifconfig
    jssh.exportHistory()
    ['ls', '//> ifconfig']
    
Save your command history to a file.

    jssh.exportHistory().join("\n").to("test.sh.js")
    
Later you can re-run your commands by executing a file.

    jssh --run test.sh.js
    
    

    
To change your current working directory you can use `cd` function, for example, to move one folder up, do `cd('..')`.
However, this syntax is a bit too cumbersome compared to the one we are used in native shells `cd ..`, fortunately 
`jssh` allows you to use any language that compiles to *JavaScript*, for example, *CoffeeScript* has a much easier syntax. 
Use `lang` property in config to specify the language you want to use, here is how to start a *CoffeeScript* shell:

    jssh --config '{"lang": "coffee"}'
    cd '..'
    
Execute a single command:

    echo 'ls' | jssh
    jssh -c 'ls'
    
Start another `jssh` session from the current one with `> jssh`.

    jssh
    a = 5
    5
    > jssh
    a
    [... a is not defined]
    exit
    a
    5
    
If you want to edit files, install `slap` package with `> npm install -g slap`, then do:

    "console.log('Hello world');".to("script.js");
    > slap script.js
    
Edit your file in `slap`, press <kbd>Ctrl</kbd> + <kbd>S</kbd>, <kbd>ENTER</kbd> to save, then <kbd>Ctrl</kbd> + 
<kbd>Q</kbd> to close `slap`. Run your script:

    > node script.js

*TODO: `jssh` should execute '.js' files. I.e. :*

    > script.js
    
Instead of:

    > node script.js
    
You can use *jssh* remotely, start a server on port `1234`:

    jssh --port 1234
    
Now, open another terminal and connect to it with *telnet*:

    telnet localhost 1234

## CLI Options

    jssh --help
    
    Usage:
      jssh [OPTIONS] [FILE]
    
    Options:
          --config-file STRINGConfiguration file
          --config STRING    Configuration as JSON string
      -c, --code STRING      Code to evaluate
      -p, --port STRING      TCP port or UNIX socket file
      -s, --stdio            Communicate through STDIO
      -h, --help             Display help and usage details

 - `--config-file` and `--config` overwrite the default config, see [Configuration](#Configuration).
 - `--code` executes code, like `jssh --code 'console.log(123)'`.
 - `--port`, `-p` tells *jssh* to listen to a port or a UNIX socket instead of STDIN for commands. When running with 
 this option, *jssh* will spawn a new shell for every new connection and redirect its IO to that socket. 
 - `--stdio`, `-s` tells *jssh* to start in a *headless* mode, i.e. it will not have a prompt and will
 listen for commands on STDIN and reply back through STDOUT, STDERR.

## Configuration

At start `jssh` reads this [default config file](./config.coffee), which you can override in two ways.
 
With `--config-file` CLI option you can tell `jssh` to read your `.json` config file, which will override the defaults.
 
    jssh --config-file /etc/myconfig.json
    
Or you can use `--config` to pass serialized *JSON* object right from the console, like so:

    jssh --config '{"prompt": " {{USER}} > ", "lang": "coffee"}'
    
Plese see the [default config file](./config.coffee) for available options with annotations. Some of them are described below.

### `config.prompt: string`

Undoubtedly this is the most important option to configure, this property sets a template for your prompt line. Use it
like this:

    jssh --config '{"prompt": " > "}'
    
Some useful variations are:

    jssh --config '{"prompt": " {{USER}} > "}'
    jssh --config '{"prompt": "{{CWD}} # "}'
    jssh --config '{"prompt": "{{CNT}}: "}'
    jssh --config '{"prompt": "{{USER}}@{{HOSTNAME}}:{{CWD}}# "}'
    
You can even do a double-decker:

    jssh --config '{"prompt": "\u250C {{MINUTES}}:{{SECONDS}} {{USER}}@{{HOSTNAME}}:{{CWD}}# .{{LANG}}\n\u2514 "}'

Consult [Unicode Drawing Characters](http://en.wikipedia.org/wiki/Box-drawing_character) table for reference.

Add colors to your prompt:

    jssh --config '{"prompt": "\u001b[31m > \u001b[39m"}'

All in all, my favorite prompt looks like this:

    jssh --config '{"prompt": "\u250C \u001b[37m\u001b[1m#{{CNT}}\u001b[22m\u001b[39m\u001b[37m\u001b[2m[{{HOURS}}{{MINUTES}}:{{SECONDS}}]\u001b[22m\u001b[39m\u001b[36m\u001b[1mjssh\u001b[22m\u001b[39m:\u001b[31m\u001b[1m{{USER}}\u001b[22m\u001b[39m@\u001b[32m\u001b[1m{{HOSTNAME_SHORT}}\u001b[22m\u001b[39m\u001b[33m\u001b[1m{{CWD}}\u001b[22m\u001b[39m \u001b[35m\u001b[1m({{LANG}})\u001b[22m\u001b[39m\n\u2514 "}'

Know a better one? Share your prompt design [here](TBD).

This is how you design one with [`chalk`](http://npmjs.com/package/chalk):

```javascript
var chalk = require('chalk');
var prompt = chalk.green(' >>> ');
console.log(JSON.stringify(prompt)); // "\u001b[32m >>> \u001b[39m"
```

List of variables:

 - `{{HOSTNAME}}`
 - `{{HOSTNAME_SHORT}}`
 - `{{USER}}`
 - `{{LANG}}`
 - `{{LANG_SHORT}}`
 - `{{CNT}}`
 - `{{TIME}}`
 - `{{HOURS}}`
 - `{{MINUTES}}`
 - `{{SECONDS}}`
 - `{{CWD}}`
 - `{{CWD_SHORT}}`
 - `{{BUFFERED_LINES}}`
 - `{{BUFFERED_LINES_+1}}`

### `config.grammar: string`

Specifies a path to a *PEG.js* grammar file, see [Grammar](#Grammar) for details.

 - `grammar` -- When you type your command and press <kbd>ENTER</kbd> in the shell, `jssh` uses this grammar to
 figure out which action to execute, see [Grammar](#Grammar) below.
 
### `config.entrypoint: string[]`

An array of command and arguments to use to proxy shell commands like `> ifconfig`.

The default is `['/bin/sh', '-c']`. If set to `null`, *jssh* will try to execute your commands with Node's
`child_process.spawn` method directly.

### `config.api: tuples[]`

## Snippets

`jssh` 'snippets' are basically *JavaScript* files that get executed in the context created by `jssh` shell, thus, they can
take full advantage of commands provided by `jssh`. Run your file like this:

    jssh snippet.js
    
You can use this for automating build tasks or provisioning servers (this was actually the reason for
creating `jssh` in the first place). The author of `jssh` uses *Docker* to provision servers, however, you cannot
put advanced logic such as *if-else* statements of *for* loops into the *Dockerfile*. This makes you use other tools like
*Puppet* or *Chef*, or going back to good old *BASH* scripts. How sad is it that there is no framework written in *Node.js*
to provision servers? Since the author already uses *JavaScript* for everything (i.e. backend, frontend, mobile apps, 
build tools etc.) and has *Node.js* installed on every machine, it seemed nice to be able to write simple "BASH" scripts
in *JavaScript* as well. Thats-why `jssh` was created, to execute *JS* line-by-line in a command line interface, to see 
the results interactively, then just put those same commands in a `.js` file (what `shelljs` does), and *voalá*.

Here is how you install an *Nginx* server on *Ubuntu*, in *CoffeeScript*:

```coffeescript
# nginx.coffee

# Check if *Nginx* is not already installed.
if not which 'nginx'

  # Install default Nginx server using APT.
  $ 'apt-get update'
  $ 'apt-get install -y nginx'

  # Clean-up after APT.
  $ 'apt-get clean'
  rm '-rf', ['/var/lib/apt/lists/*', '/tmp/*', '/var/tmp/*']

  $ 'service nginx start'
  echo GET '127.0.0.1'
```

Your IDE probably already automatically compiles `.coffee` files to `.js` (if not, I recommend 
[Webstorm](https://www.jetbrains.com/webstorm/)), then you just do:

    jssh nginx.js
    
If you still want to run the `.coffee` file itself, do:

    jssh --config '{"lang": "coffee"}' nginx.coffee

## API

API of `jssh` are global functions that get exposed to the running context. APIs are basically `npm` packages whose
methods get exposed as global functions, for example, that is how you can run different 'commands' in the console, like
`ls()` or `cd()`, etc.

Run `jssh` with functions provided by `shelljs` package:

    jssh --config '{"api":[[null, "shelljs"]]}'
    
Use `jssh-api-jssh-bin` instead provides `id`, `chown` commands.
    
    jssh --config '{"api":[[null, "jssh-api-jssh-bin"]]}'

## Grammar

*jssh* does not have a predefined command language, but rather it just executes *actions*. The grammar tells *jssh*
which actions to execute.

Grammar in defined in [PEG.js](http://pegjs.org/) syntax; the default one is stored in 
[./grammar/default.peg](./grammar/default.peg) file. You can provide your own one by overwriting the `grammar` property
in the config.

Currently, `jssh` knows how to execute these three actions: `code`, `exec`, `exec_code`.

 - `code` -- This action evaluates the *JavaScript* code, like when you type `ls()`, *jssh* evaluates the global `ls`
 function running in that context. If shell is running in different language, say *CoffeeScript*, it first compiles it
 to *JavaScript*.
 - `exec` -- This action proxies the command to the `entrypoint` defined in the config. If `entrypoint` is not defined,
 it just uses `child_process.spawn`. This action runs when you type in console commands prefixed with `>`, like `> ifconfig`.
 - `exec_code` -- This action is like `exec`, but first it evaluates the code like the `code` action, for example, 
 `$> "p" + "w" + "d"`.

The actions that *jssh* receives from *PEG.js* are in the following format: 

    > npm install jssh --no-bin-links
    {
        action: "exec",
        payload: {
            command: "npm",
            arguments: ["install", "jssh", "--no-bin-links"]
        }
    }
    
    console.log('Hello world');
    {
        action: "code",
        payload: {
            code: "console.log('Hello world');"
        }
    }
    
*P.S.* It actually has another command reserved, `stream`, with a tilde syntax: `~ fs.createReadStream('file.txt')`. It
is not implemented yet, but it will do something interesting with the streams. Suggestions are welcome!

*P.P.S.* There is actually another command `.` (a single dot). That is a shorthand for writing this:

    $> process.argv.join(" ")
    
identical to:

    .
    
Can you guess what it does?

### `--api=string[]`

Default: `--api=shelljs`

A comma separated list of packages to use as global API for the the shell session. An "API" is considered a static object,
whose properties will be exported to the global namespace, this allows us to run those functions in the shell as commands. 

For example, when you run `ls` command in the shell to display a list of files in the current directory, it is not
implemented by `jssh` itself, but rather it is imported from the `shelljs` package:

    jssh > ls
    [ 'bin',
        ...
    ]
        
You can add extra API simplify many tasks. For example, to simplify deployment tasks use `mecano`.

    jssh --api=shelljs,mecano
    ...
 
Namespace APIs.

    jssh --api=shelljs,dep:deply_package

You can create your own API.

    // my-api.js
    module.exports = {
        time: function() {
            return +new Date();
        }
    };

Add your custom API


### `--prompt=string`
 
Sets a custom prompt string. Specify a string or JSON string as your prompt.

Usage:

    jssh --prompt 'My Prompt > '

Default: `jssh > `

You can add colors to your prompt. To add color information, you have to provide string serialized in JSON, which
contains console color information.

Let's say we want a prompt that displays our username in

    jssh
    require

Create your own colorful prompt.

    var chalk = require("chalk");
    var prompt = chalk.green("jssh") + " @ " + chalk.yellow("{{CWD}} > ");
    var str = JSON.stringify(prompt);
    console.log(str); // "\u001b[32mjssh\u001b[39m @ \u001b[33m{{CWD}} > \u001b[39m"
        
Use your colorful prompt:

    jssh --prompt '"\u001b[32mjssh\u001b[39m @ \u001b[33m{{CWD}} > \u001b[39m"'
    
### Simulate a Makefile

*TODO:*

Export a global `make` variable, which is an empty object. Allow to run command from command line after the file is
executed, to run a specific make command.

    #!/usr/bin/env jssh --lang coffee --make
    
    make.all ->
        make.compile()
        make.deploy()
        
    make.compile ->
        # ...
        
    make.deploy ->
        # ...
        
Run the deploy command:

    makefile all
    jssh -f makefile --lang coffee --make all

### With Docker

    docker run -it --rm streamich/jssh jssh

Dockerfile:

    ...

## TODOs

Portability: (1) edit `Npm.ts`; (2) async HTTP requests.

Create another *JavaScript* language, that would be well suited for executing shell commands. It could be a dialect of
*CoffeScript*. One feature could be to have strings without quotes, just like in `YAML` files. Then you could do:

    jssh > ls ~
    
Instead of (in *JavaScript* and *CoffeScript*):
    
    jssh > ls("~")
    jssh > ls '~'

## Other

Tested on Ubuntu 14.04 with Node.js 0.12.4.

On Windows looks to be working as well.

## License

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
