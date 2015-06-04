var child_process = require("child_process");

var ch = child_process.spawn("/code/jssh/bin/jssh", ["-h"]);
ch.stdin.write("ls\n");
ch.stdin.write("ls");
ch.stdout.pipe(process.stdout);
ch.stderr.pipe(process.stdout);
