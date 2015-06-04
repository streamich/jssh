var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function() {
    conn.exec('ls', {}, function(err, res) {

        console.log('command result');
        console.log(err, res);
    });

    return;
    conn.shell(function(err, stream) {
        if (err) throw err;

        stream.on('close', function() {
            console.log('Stream :: close');
            conn.end();
        }).on('data', function(data) {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', function(data) {
                console.log('STDERR: ' + data);
            });

        stream.end('> ls -l\nexit\n');
    });
}).connect({
    host: '127.0.0.1',
    port: 20333,
    username: 'admin',
    password: 'admin'
    //privateKey: require('fs').readFileSync('/here/is/my/key')
});


