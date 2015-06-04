var net = require("net");
var path = require("path");
var child_process = require("child_process");
var fs = require("fs");
var Session = (function () {
    function Session(socket) {
        this.socket = socket;
    }
    Session.prototype.start = function () {
        var executable = path.resolve(__dirname + "/../../bin/jssh");
        var ch = child_process.spawn(executable, []);
        this.socket.pipe(ch.stdin);
        ch.stdout.pipe(this.socket);
        ch.stderr.pipe(this.socket);
    };
    return Session;
})();
var AppSocket = (function () {
    function AppSocket(opts) {
        this.shellOptions = opts;
    }
    AppSocket.prototype.run = function (port, opts) {
        var self = this;
        var logger = console.log.bind(console);
        logger("Starting server on port: " + port);
        this.server = net.createServer(this.startSession.bind(this));
        var on_listen = function () {
            logger('Server started.');
        };
        // Port is a UNIX socket file, below we do what we can to make it work.
        if (isNaN(parseInt(port))) {
            this.server.on('listening', function () {
                fs.chmod(port, 0777);
                on_listen();
            });
            // double-check EADDRINUSE
            this.server.on('error', function (e) {
                logger('Error', e);
                logger(e);
                if (e.code !== 'EADDRINUSE')
                    throw e;
                net.connect({ path: port }, function () {
                    throw e;
                }).on('error', function (e) {
                    if (e.code !== 'ECONNREFUSED')
                        throw e;
                    fs.unlinkSync(port); // not in use: delete it and re-listen
                    self.server.listen(port, on_listen);
                });
            });
            this.server.listen(port);
        }
        else {
            // Port is a numeric port.
            this.server.listen(port, on_listen);
        }
    };
    AppSocket.prototype.startSession = function (socket) {
        var session = new Session(socket);
        session.start();
    };
    return AppSocket;
})();
module.exports = AppSocket;
