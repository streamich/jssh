
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
  entrypoint: if is_win then null else ['/bin/sh', '-c']

  # Language in from which `code` commands will be compiled to JavaScript.
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
#    [null,    'jssh-api-jssh-bin'] # If you want to compile.
#    [null,    'jssh-api-jssh-native']
    ['util',  'jssh-api-util']
    ['conf',  'jssh-api-conf']
  ],

  # A list of [<namespace>, <package>] tuples of packages that will be 'required' as global variables:
  #
  #   require(<package>) -> global[<namespace>]
  require: [
    ['_',     'lodash']
  ],

  # Whether to show verbose output.
  verbose: false

  # Whether to show debut output.
  debug: false

  # Whether to print 'undefined' in terminal, if expression evaluates to 'undefined'.
  undef: false

  # Number of commands to save in history.
  history: 100 # Currently not supported :), `jssh` saves everyting.
