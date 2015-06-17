var Action = (function () {
    function Action() {
        /**
         * Action name for reference in `History` object.
         * @type {string}
         */
        this.name = "action";
        this.shell = null;
        this.payload = null;
        // Results and errors of executing the action.
        this.error = null;
        this.result = null;
        this.out = null;
        this.printOutput = true;
    }
    Action.prototype.setShell = function (shell) {
        this.shell = shell;
        return this;
    };
    Action.prototype.setPayload = function (payload) {
        this.payload = payload;
        return this;
    };
    Action.prototype.run = function (cb) {
    };
    Action.prototype.setResult = function (result) {
        this.result = result;
        return this;
    };
    Action.prototype.setError = function (error) {
        this.error = error;
        return this;
    };
    return Action;
})();
exports.Action = Action;
