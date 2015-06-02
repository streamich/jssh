# JavaScript Shell

A shell in *JavaScript*, use *JavaScript* instead of BASH.

**This project is under development in very early alpha. Use at your own risk. Many parts of this project will change
in the future.**

## Installation

Install as a global `npm` package.

    npm install -g jssh
  
## Usage

To start the shell in REPL mode, just type `jssh` in your console.

    jssh
    
Execute arbitrary *JavaScript*.

    1 + 1
    2
    
    typeof require
    function
    
Execute built-in global functions, `jssh` exposes a number of global functions to work with your machine. In particular,
it heavily uses [`shelljs`](http://npmjs.com/package/shelljs) package for Unix-like shell commands.
 
    ls()
    ls // Evaluates global functions automatically.
    
To execute shell commands start with `>` symbol. This way your commands will be 'proxied' to the native system shell
definded by the `entrypoint` property in configuration file.

    > ls
    > whoami
    root
    
Alternatively you can use `#!` or `//>` (instead of `>`) to execute a shell commands. Advantage of using `//>` is that 
`//` starts a comment, which makes your command a valid *JavaScript* code. (Use `#!` for *CoffeScript*. Yes, you can
use *CoffeeScript* or any language that compiles to *JavaScript*, read below.) 

    //> ifconfig
    #! ping google.com -c 1

You can also execute commands interactively -- first the code is evaluated to a string and then proxied to your system 
shell. To execute your command interactively use `$` symbol like so: `$>`, `//$>`, `#$>`, or `#!$`.

    $> "p" + "w" + "d"
    
    var is_windows = !!process.env.WINDIR;
    $> is_windows ? "ipconfig" : "ifconfig";
    
Or simply use a predefined funcion provided by `jssh-api-jssh` API (see below on APIs).

    $('pwd')

Number directories with indices.

    [_.map(ls(), function(dir, i) { return i; }), ls()]

Get command help (TODO) (do we need this?):

    help('ls')
    help('cd')
    help('<command>')
    
`jssh` uses `//` syntax at the end of line to indicate that the code will continue on the next line. This is experimental
feature. A benefit is that the *JavaScript* code is still valid even with these comment marks at the end of line.
 
    if(true) { //
        console.log("multiline code"); //
    }
    multiline code
    
Get the history of your commands using `jssh.exportHistory()` method.

    ls
    //> ifconfig
    jssh.exportHistory()
    ['ls', '//> ifconfig']
    
Save your command history to a file.

    jssh.exportHistory().join("\n").to("test.sh.js")
    
Later you can re-run your commands by executing a file.

    jssh --run test.sh.js
    
To change your current working directory you can use `cd` function, for example to move one folder up do `cd('..')`.
However, this syntax is a bit too cumbersome compared to the one we are used in native shells `cd ..`, fortunately in 
`jssh` you can use any language that compiles to *JavaScript*, for example, *CoffeeScript* has a much easier syntax. 
Use `--lang` argument to specify language you want to use, here is how to start a *CoffeeScript* shell:

    jssh --config '{"lang": "coffee"}'
    cd '..'
    
Execute a single command:

    echo 'ls' | jssh
    jssh -c 'ls'
    

## CLI Options

...

## Configuration

At start `jssh` reads this [default config file](./config.coffee), which you can override in two ways.
 
With `--config-file` CLI option you can tell `jssh` to read your `.json` config file, which will override the defaults.
 
    jssh --config-file /etc/myconfig.json
    
Or you can use `--config` to pass serialized *JSON* object right in the console, like so:

    jssh --config '{"prompt": " {{USER}} > ", "lang": "coffee"}'
    
Plese see the [default config file](./config.coffee) for available options with annotations. Some of them are:

### `config.grammar`

 - `grammar` -- When you type your command and press <kbd>ENTER</kbd> in the shell, `jssh` uses this grammar to
 figure out which action to execute, see [Grammar](#Grammar) below.
 
### `config.entrypoint`

 - `entrypoint` -- The program to proxy to your `exec` actions, like `> ifconfig`.

## Snippets

`jssh` 'snippets' are *JavaScript* files that get executed in the context created by `jssh` shell, thus, they can
take full advantage of commands provided by `jssh`.

    jssh -f snippet.js
    
### Example: Install *Nginx* server on Ubuntu

```coffeescript
# Check if `nginx` is not already installed.
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


## API

API of `jssh` are global functions that get exposed to the running context. APIs are basically `npm` packages whose
methods get exposed as global functions, for example, that is how you can run different 'commands' in the console, like
`ls()` or `cd()`, etc. 

Run `jssh` with functions provided by `shelljs` package:

    jssh --config '{"api":[[null, "shelljs"]]}'
    
Use `jssh-api-jssh-bin` instead provides `id`, `chown` commands.
    
    jssh --config '{"api":[[null, "jssh-api-jssh-bin"]]}'

## Grammar

`jssh` does not have a predefined command language, but rather it just executes *actions*. The grammar tells `jssh`
which action to execute.

Grammar in defined in [PEG.js](http://pegjs.org/) syntax; the default one is stored in 
[./grammar/default.peg](./grammar/default.peg) file. You can provide your own one by overwriting the `grammar` property
in the config.

Currently, `jssh` knows how to execute these three actions: `code`, `exec`, `exec_code`.

 - `code` -- This action evaluates the *JavaScript* code, like when you type `ls()`, *jssh* evaluates the global `ls`
 function running in that context. If shell is running in different language, say *CoffeeScript*, it first compiles it
 to *JavaScript*.
 - `exec` -- This action proxies the command to the `entrypoint` defined in the config. This action runs when you type
 in console, for example, `> ifconfig`.
 - `exec_code` -- This action is same as `exec`, but first it evaluates the code like in `code` action and then proxies
 the resulting `string` to the `entrypoint`, for example, `$> "p" + "w" + "d"`.

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
    
*P.S.* It, actually, has another command, `stream`, reserved with tilde syntax: `~ fs.createReadStream('file.txt')`. It
is not implemented yet, but it will probably do something interesting with streams. Any suggestions welcome!
    

## Options

    jssh --help
    Usage:
      index [OPTIONS] [ARGS]
    
    Options:
      -f, --file STRING      Execute a file
      -c, --command STRING   Execute a specific command
      -p, --prompt STRING    Propmt to use, default is 'jssh > '
      -a, --api [STRING]     List of packages to use as global API (Default is shelljs;util:jssh-api-util;conf:jssh-api-conf)
      -r, --require [STRING] List of packages to require (Default is _:lodash)
      -g, --grammar STRING   File with PEG grammar to use
      -v, --verbose BOOLEAN  Verbose mode
          --entrypoint [STRING]Similar to ENTRYPOIN in Docker (Default is /bin/sh -c)
          --debug BOOLEAN    Debug mode
          --undef BOOLEAN    Print undefined
          --history [NUMBER] Length of command history (Default is 100)
      -h, --help             Display help and usage details

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

Create another *JavaScript* language, that would be well suited for executing shell commands. It could be a dialect of
*CoffeScript*. One feature could be to have strings without quotes, just like in `YAML` files. Then you could do:

    jssh > ls ~
    
Instead of (in *JavaScript* and *CoffeScript*):
    
    jssh > ls("~")
    jssh > ls '~'
