# JavaScript Shell

A shell in *JavaScript*, use *JavaScript* instead of BASH.

**This project is under development in very early alpha. Use at your own risk. Many parts of this project will change
in the future.**
  
## Usage

Install as a global package. And start the shell in REPL mode.

    npm install -g jssh
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
definded by the `--entrypoint` argument.

    > ls
    > whoami
    root
    
Alternatively you can use `#!` or `//>` (instead of `>`) to execute a shell command. Advantage of using `//>` is that 
`//` starts a comment, which makes your command a valid *JavaScript* code. (Use `#!` for *CoffeScript*. Yes, you can
use *CoffeeScript* or any language that compiles to *JavaScript*, read below.) 

    //> ifconfig
    #! ping google.com -c 1

You can also execute commands interactively -- first the code is evaluated to a string and then proxied to your system 
shell. To execute your command interactively use `$` symbol like so: `$>`, `//$>`, `#$>`, or `#!$`.

    $> "p" + "w" + "d"
    
    var is_windows = !!process.env.WINDIR;
    $> is_windows ? "ipconfig" : "ifconfig";

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

    jssh -f test.sh.js
    
To change your current working directory you can use `cd` function, for example to move one folder up do `cd('..')`.
However, this syntax is a bit too cumbersome compared to the one we are used in native shells `cd ..`, fortunately in 
`jssh` you can use any language that compiles to *JavaScript*, for example, *CoffeeScript* has a much easier syntax. 
Use `--lang` argument to specify language you want to use, here is how to start a *CoffeeScript* shell:

    jssh --lang coffee
    cd '..'    
    
...    
    
    ("#!/usr/bin/env jssh\n" + jssh.exportHistory().join("\n")).to("test.sh.js")

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

    var clc = require("cli-color");
    var prompt = clc.green("jssh") + " @ " + clc.yellow("{{CWD}} > ");
    var str = JSON.stringify(prompt);
    console.log(str); // "\u001b[32mjssh\u001b[39m @ \u001b[33m{{CWD}} > \u001b[39m"
        
Use your colorful prompt:

    jssh --prompt '"\u001b[32mjssh\u001b[39m @ \u001b[33m{{CWD}} > \u001b[39m"'
    
### Simulate a Makefile

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
