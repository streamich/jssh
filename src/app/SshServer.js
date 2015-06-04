var config = require("../../config");
var path = require("path");
var child_process = require("child_process");
var fs = require("fs");
var info = require("../info");
var ssh2 = require('ssh2');
var utils = ssh2.utils;
var Server = ssh2.Server;
var Message = (function () {
    function Message(data, error) {
        if (data === void 0) { data = null; }
        if (error === void 0) { error = null; }
        this.id = Message.cnt++;
        this.data = data;
        this.error = error;
    }
    Message.prototype.pack = function () {
        var packed = {
            i: this.id,
            d: this.data
        };
        if (this.error)
            packed.e = this.error;
        return packed;
    };
    Message.prototype.unpack = function (frame) {
        if (typeof frame != "object")
            throw Error("Invalid frame.");
        if (typeof frame.id != "number")
            throw Error("Invalid frame.");
        this.id = frame.i;
        this.data = frame.d;
        this.error = frame.e;
    };
    Message.cnt = 0;
    return Message;
})();
var Fork = (function () {
    function Fork() {
    }
    Fork.prototype.executable = function () {
        return info.main;
    };
    Fork.prototype.start = function () {
        var args = []; // TODO: populate this from config file.
        this.child = child_process.fork(this.executable(), args);
        this.child.on("message", this.onMessage.bind(this));
    };
    Fork.prototype.setStdio = function (stdin, stdout, stderr) {
        if (stdin)
            stdin.pipe(this.child.stdin);
        if (stdout)
            this.child.stdout.pipe(stdout);
        if (stderr)
            this.child.stderr.pipe(stderr);
    };
    Fork.prototype.request = function (message, cb) {
        // { cmd: "NODE_*" } - not allowed.
        // https://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle
        if ((typeof message == "object") && message.cmd && (typeof message.cmd == "string") && (message.cmd.substr(0, 5) == "NODE_")) {
            cb(Error("Invalid message."));
            return;
        }
        var msg = new Message(message);
        if (cb)
            this.callbacks[msg.id] = cb;
        this.child.send(message.pack());
    };
    Fork.prototype.onMessage = function (frame) {
        var msg = new Message;
        msg.unpack(frame);
        var cb = this.callbacks[msg.id];
        if (cb) {
            cb(frame.error, frame.data);
        }
        else {
            throw Error("Invalid frame ID.");
        }
    };
    return Fork;
})();
var AppSshServer = (function () {
    function AppSshServer(opts) {
        this.shellOptions = opts;
        this.logger = console.log.bind(console);
    }
    AppSshServer.prototype.getPrivateKey = function () {
        var file = config.ssh.privateKey;
        if (file.indexOf(path.sep) == -1) {
            file = __dirname + '/../../key/server.key';
        }
        file = path.resolve(file);
        return fs.readFileSync(file);
    };
    AppSshServer.prototype.run = function () {
        var logger = this.logger;
        var server = new Server({
            privateKey: this.getPrivateKey()
        }, this.onNewClient.bind(this));
        server.listen(this.shellOptions.port, this.shellOptions.ssh, function () {
            logger('Listening on port ' + server.address().port);
        });
    };
    AppSshServer.prototype.onNewClient = function (client) {
        var logger = this.logger;
        logger('Client connected!');
        client.on('authentication', this.onAuthentication.bind(this)).on('ready', function () {
            logger('Client authenticated!');
            client.on('session', function (accept, reject) {
                var session = accept();
                var fork = new Fork;
                fork.start();
                session.on('exec', function (accept, reject, info) {
                    logger('Command requested');
                    logger(info.command);
                    if (typeof accept == "function") {
                        var channel = accept();
                        fork.request(info.command, function (err, res) {
                            if (err)
                                channel.w;
                        });
                    }
                    else {
                        fork.request(info.command);
                    }
                });
                session.on('pty', function (accept, reject, info) {
                    logger('PTY requested.');
                    accept();
                });
                session.on('shell', function (accept, reject) {
                    logger('Shell requested.');
                    var channel = accept();
                    fork.setStdio(channel, channel, channel);
                });
            });
        }).on('end', function () {
            logger('Client disconnected');
        });
    };
    AppSshServer.prototype.onAuthentication = function (ctx) {
        if (ctx.method === 'password') {
            if (!config.ssh || !config.ssh.users)
                return ctx.reject();
            if (!config.ssh.users[ctx.username])
                return ctx.reject();
            if (config.ssh.users[ctx.username] !== ctx.password)
                return ctx.reject();
            ctx.accept();
        }
        else {
            ctx.reject();
        }
    };
    return AppSshServer;
})();
module.exports = AppSshServer;
