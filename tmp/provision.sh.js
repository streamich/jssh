
// Install default Redis server using APT.
//> apt-get update && apt-get install -y redis-server

// List of ports on which we will run redis servers.
var first_port = 6379;
var server_count = 64;
var ports = [];
for(var i = 0; i < server_count; i++) ports.push(first_port + i);

// Directory where configuration templates are located.
var dir = __dirname;

// Create necessary directories.
mkdir('-p', '/var/run/redis');
mkdir('-p', '/var/log/redis');

// Configure each server separately.
var tpl_conf = cat(__dirname + "/redis.conf"); // Create a separate 'redis.conf' config for each server.
var tpl_init = cat(__dirname + "/redis-server.sh"); // Init daemon temlate.
ports.forEach(function(port) { //
    mkdir('-p', '/var/lib/redis-' + port); //
    exec('chown redis.redis /var/lib/redis-' + port); //
    tpl_conf.replace(new RegExp("__PORT__", "g"), port).to('/etc/redis/redis-' + port + '.conf'); //
    tpl_init.replace(new RegExp("__PORT__", "g"), port).to('/etc/init.d/redis-server-' + port); //
    exec('update-rc.d redis-server-' + port + ' defaults'); //
    exec('/etc/init.d/redis-server-' + port + ' start'); //
});
