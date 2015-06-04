
# `$` stands for '$uper prompt'.
# List available hosts.
$

# Proxy command to shell.
$ 'ifconfig'

# Execute JS.
$ -> ls()

# Switch to second host.
$(1)

# Proxy a command to shell on the first host. (Localhost is always the first shell?)
$0 'ls'
$(0) 'whoami'

# Execute a command on 2nd, 3rd, 4th, and 5th hosts.
$([1..4]) 'ls /etc'

# Execute JS on the 2nd host.
$1 -> cd '../test'

# Execute a command on all hosts.
$.all 'rm -rf *'
$.all -> rm '-rf', '/'

# Send data across hosts.
$




