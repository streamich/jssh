import builder = require("../builder");
var config = require("../../config");
import net = require("net");
import path = require("path");
import child_process = require("child_process");
import fs = require("fs");
import info = require("../info");
var ssh2 = require('ssh2');
var utils = ssh2.utils;
var Server = ssh2.Server;


class Message {

    static cnt = 0;

    id = Message.cnt++;
    error;
    data;

    constructor(data = null, error = null) {
        this.data = data;
        this.error = error;
    }

    pack() {
        var packed: any = {
            i: this.id,
            d: this.data,
        };
        if(this.error) packed.e = this.error;
        return packed;
    }

    unpack(frame) {
        if(typeof frame != "object") throw Error("Invalid frame.");
        if(typeof frame.id != "number") throw Error("Invalid frame.");
        this.id = frame.i;
        this.data = frame.d;
        this.error = frame.e;
    }
}

class Fork {

    child;

    callbacks: {};

    constructor() {}

    executable() {
        return info.main;
    }

    start() {
        var args = []; // TODO: populate this from config file.
        this.child = child_process.fork(this.executable(), args);
        this.child.on("message", this.onMessage.bind(this));
    }

    setStdio(stdin, stdout, stderr) {
        if(stdin) stdin.pipe(this.child.stdin);
        if(stdout) this.child.stdout.pipe(stdout);
        if(stderr) this.child.stderr.pipe(stderr);
    }

    request(message, cb) {
        // { cmd: "NODE_*" } - not allowed.
        // https://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle
        if((typeof message == "object") && message.cmd && (typeof message.cmd == "string") && (message.cmd.substr(0, 5) == "NODE_")) {
            cb(Error("Invalid message."));
            return;
        }

        var msg = new Message(message);
        if(cb) this.callbacks[msg.id] = cb;
        this.child.send(message.pack());
    }

    onMessage(frame) {
        var msg = new Message;
        msg.unpack(frame);
        var cb = this.callbacks[msg.id];
        if(cb) {
            cb(frame.error, frame.data);
        } else {
            throw Error("Invalid frame ID.");
        }
    }

}


export = AppSshServer; class AppSshServer {

    server;

    shellOptions;

    logger;

    constructor(opts) {
        this.shellOptions = opts;
        this.logger = console.log.bind(console);
    }

    getPrivateKey() {
        var file = config.ssh.privateKey;
        if(file.indexOf(path.sep) == -1) {
            file = __dirname + '/../../key/server.key';
        }
        file = path.resolve(file);
        return fs.readFileSync(file);
    }

    run() {
        var logger = this.logger;

        var server = new Server({
            privateKey: this.getPrivateKey(),
        }, this.onNewClient.bind(this));

        server.listen(this.shellOptions.port, this.shellOptions.ssh, () => {
            logger('Listening on port ' + server.address().port);
        });
    }

    onNewClient(client) {
        var logger = this.logger;
        logger('Client connected!');

        client
            .on('authentication', this.onAuthentication.bind(this))
            .on('ready', function() {
                logger('Client authenticated!');

                client.on('session', function(accept, reject) {
                    var session = accept();
                    var fork = new Fork;
                    fork.start();
                    session.on('exec', function(accept, reject, info) {
                        logger('Command requested');
                        logger(info.command);

                        if(typeof accept == "function") { // Client requested response.
                            var channel = accept();
                            fork.request(info.command, (err, res) => {
                                if(err) channel.w
                            });
                        } else { // Client did not request response.
                            fork.request(info.command);
                        }

                    });
                    session.on('pty', function(accept, reject, info) {
                        logger('PTY requested.');
                        accept();
                    });
                    session.on('shell', function(accept, reject) {
                        logger('Shell requested.');
                        var channel = accept();
                        fork.setStdio(channel, channel, channel);
                    });
                });
            }).on('end', function() {
                logger('Client disconnected');
            });
    }

    onAuthentication(ctx) {
        if(ctx.method === 'password') {
            if(!config.ssh || !config.ssh.users)                    return ctx.reject();
            if(!config.ssh.users[ctx.username])                     return ctx.reject();
            if(config.ssh.users[ctx.username] !== ctx.password)     return ctx.reject();
            ctx.accept();
        } else {
            ctx.reject();
        }
    }

}
