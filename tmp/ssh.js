var fs = require('fs'),
    crypto = require('crypto');
var buffersEqual = require('buffer-equal-constant-time');
var ssh2 = require('ssh2'),
    utils = ssh2.utils,
    Server = ssh2.Server;

//var pubKey = utils.genPublicKey(utils.parseKey(fs.readFileSync(__dirname + '/key/key.pub')));

new Server({
    privateKey: fs.readFileSync(__dirname + '/key/key.key')
}, function(client) {
    console.log('Client connected!');

    client.on('authentication', function(ctx) {
        if (ctx.method === 'password'
            && ctx.username === 'foo'
            && ctx.password === 'bar') {
            ctx.accept();
    } else
            ctx.reject();
    }).on('ready', function() {
        console.log('Client authenticated!');

        client.on('session', function(accept, reject) {
            var session = accept();
            session.once('exec', function(accept, reject, info) {
                //console.log('Client wants to execute: ' + inspect(info.command));
                //var stream = accept();
                //stream.stderr.write('Oh no, the dreaded errors!\n');
                //stream.write('Just kidding about the errors!\n');
                //stream.exit(0);
                //stream.end();
            });
            session.once('shell', function(accept, reject) {
                var channel = accept();
                channel.on("data", function(data) {
                    console.log(data.toString());
                });
            });
        });
    }).on('end', function() {
        console.log('Client disconnected');
    });
}).listen(9999, '127.0.0.1', function() {
        console.log('Listening on port ' + this.address().port);
    });