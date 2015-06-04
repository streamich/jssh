
is_win = /^win/.test process.platform

module.exports =

  # Prompt string, such as ' > '. You can also use color codes for your prompt. Example: `"\u001b[31m > \u001b[39m"`.
  prompt: null

  # Path to `peg.js` file for command language to use, see `/grammar` folder.
  # `jssh` does not have a predefined command language, but rather it can be dynamically changed by this option.
  # For example, when you evaluate a bash command using 'prompt syntax':
  #
  #   > ifconfig
  #
  # It is definded in this grammar file that this command should be evaluated using the system shell.
  grammar: 'default.peg'

  # Similar to `ENTRYPOINT` command in `Dockerfile`.
  # TODO: Git bash (or some othe shell) comes with `/bin/sh` for Windows. So change this to work on Windows.
  # TODO: Alternatively, use `cmd.exe`.
  entrypoint: if is_win then null else ['/bin/sh', '-c']

  # Language in from which `code` commands will be compiled to JavaScript. You can set it to `coffee`.
  lang: 'js'

  # A list of packages whose methods to expose as global functions:
  #
  #   require(<package>)["method"] -> global["method"]
  #
  # The format is: [<namespace>, <package>].
  # If namespace is provided the function will be namespaced:
  #
  #   require(<package>)["method"] -> global[<namespace>]["method"]
  #
  # If package is missing, it is automatically downloaded from `npm`.
  api: [
    [null,    'jssh-api-jssh']
    ['util',  'jssh-api-util']
    ['conf',  'jssh-api-conf']
#    [null,    'jssh-api-jssh-bin']     # If you want to compile. (Depends on packages that need to compile at install.)
#    [null,    'shelljs']               # If you want to use a tested package.
#    ['make',  'jssh-api-make']         # Create makefile utilities.
  ],

  # A list of [<namespace>, <package>] tuples of packages that will be 'required' as global variables:
  #
  #   require(<package>) -> global[<namespace>]
  require: [
    ['_',     'lodash']
#    ['async', 'async']
#    ['hl',    'highland']
  ],

  # Whether to show verbose output.
  verbose: false

  # Whether to show debut output.
  debug: false

  # Whether to print 'undefined' in terminal, if expression evaluates to 'undefined'.
  undef: false

  # Number of commands to save in history.
  history: 100 # Currently not supported :), `jssh` saves everyting.

  # If not `null` will set current working directory to this value at startup.
  pwd: null

  ssh:
    privateKey: 'server.key'
    publicKey: 'client.pub'

    # Map of usernames -> passwords, for users allowed to login. Set to `{}` if you want to disable logins by password.
    users:
      admin: 'admin'

  # CLI parameters to provide to spawned child `jssh` processes when running a `--port` or `--ssh` servers.
  childArgs: ['--config', {}]
