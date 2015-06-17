var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * A 'computer' where actions are executed, could be localhost, could be some other PC over SSH or some other
 * transport protocol.
 */
var Host = (function () {
    function Host() {
    }
    Host.prototype.runAction = function (myaction, cb) {
        myaction.run(function (err, res) {
            cb(err, res, myaction.printOutput);
        }.bind(this));
    };
    return Host;
})();
exports.Host = Host;
var HostLocalhost = (function (_super) {
    __extends(HostLocalhost, _super);
    function HostLocalhost() {
        _super.apply(this, arguments);
    }
    return HostLocalhost;
})(Host);
exports.HostLocalhost = HostLocalhost;
var Collection = (function () {
    function Collection() {
        this.hosts = [];
        // Currenctly active host.
        this.active = null;
    }
    Collection.prototype.add = function (host, make_active) {
        if (make_active === void 0) { make_active = false; }
        this.hosts.push(host);
        if (make_active) {
            this.active = host;
        }
        return this;
    };
    Collection.prototype.getActive = function () {
        return this.active;
    };
    // Run an action on all hosts in this collection.
    Collection.prototype.runAction = function (myaction, cb) {
    };
    // Get a subset of hosts.
    Collection.prototype.filter = function (selector) {
        var collection = new Collection;
        return collection;
    };
    return Collection;
})();
exports.Collection = Collection;
