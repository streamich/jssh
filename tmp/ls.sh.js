//> ls
//$> "ls"

var a = "asdf\n\r";

console.log(JSON.stringify(a));

a = a.replace(/^|([\n\r])+$/g, '');

console.log(JSON.stringify(a));