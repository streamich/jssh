/// <reference path="./typing.d.ts" />
import shell = require('./shell');


declare var sh: shell.Shell;



class SuperPrompt {

    getLocalShell() {
        return sh;
    }

    static code(code) {

    }

}

function $(code) {
    if(typeof code == 'string') {
        console.log('execute', code);
    } else if(typeof code == 'number') {
        console.log('select set', code);
        var $_tmp: any = function $_tmp(code) {

        };
        $_tmp.__jssh_api = true;
        $_tmp.__jssh_async = true;
        return $_tmp;
    }
}


module.exports = {
    $: $
};
