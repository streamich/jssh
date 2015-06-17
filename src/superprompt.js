var SuperPrompt = (function () {
    function SuperPrompt() {
    }
    SuperPrompt.prototype.getLocalShell = function () {
        return sh;
    };
    SuperPrompt.code = function (code) {
    };
    return SuperPrompt;
})();
function $(code) {
    if (typeof code == 'string') {
        console.log('execute', code);
    }
    else if (typeof code == 'number') {
        console.log('select set', code);
        var $_tmp = function $_tmp(code) {
        };
        $_tmp.__jssh_api = true;
        $_tmp.__jssh_async = true;
        return $_tmp;
    }
}
module.exports = {
    $: $
};
