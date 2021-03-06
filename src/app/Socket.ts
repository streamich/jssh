import builder = require("../builder");
import net = require("net");
import path = require("path");
import child_process = require("child_process");
import fs = require("fs");


class Session {

    socket;

    constructor(socket) {
        this.socket = socket;
    }

    start() {
        var executable = path.resolve(__dirname + "/../../bin/jssh");
        var ch = child_process.spawn(executable, []);
        this.socket.pipe(ch.stdin);
        ch.stdout.pipe(this.socket);
        ch.stderr.pipe(this.socket);
    }

}


export = AppSocket; class AppSocket {

    server;

    shellOptions;

    constructor(opts) {
        this.shellOptions = opts;
    }

    run(port: string|number, opts:builder.IOpts) {
        var self = this;
        var logger = console.log.bind(console);

        logger("Starting server on port: " + port);

        this.server = net.createServer(this.startSession.bind(this));
        var on_listen = () => {
            logger('Server started.');
        };

        // Port is a UNIX socket file, below we do what we can to make it work.
        if(isNaN(parseInt(<string> port))) {
            this.server.on('listening', () => {
                fs.chmod(<string> port, 0777);
                on_listen();
            });

            // double-check EADDRINUSE
            this.server.on('error', function(e) {
                logger('Error', e);
                logger(e);
                if(e.code !== 'EADDRINUSE') throw e;
                net.connect({path: port}, () => {
                    throw e; // really in use: re-throw
                }).on('error', function(e) {
                    if(e.code !== 'ECONNREFUSED') throw e;
                    fs.unlinkSync(<string> port); // not in use: delete it and re-listen
                    self.server.listen(port, on_listen);
                });
            });

            this.server.listen(port);
        } else {

            // Port is a numeric port.
            this.server.listen(port, on_listen);
        }

    }

    startSession(socket) {
        var session = new Session(socket);
        session.start();
    }

}
