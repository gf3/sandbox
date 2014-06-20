var Sandbox = require("../lib/sandbox")
  , s = new Sandbox()

// Example 1 - Standard JS
s.run( "1 + 1", function(error, result) {
  console.log( "Example 1: " + result + "\n" )
})

// Example 2 - Something slightly more complex
s.run( "(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", function(error, result) {
  console.log( "Example 2: " + result + "\n" )
})

// Example 3 - Syntax error
s.run( "lol)hai", function(error, result) {
  console.log( "Example 3: " + result + "\n" )
});

// Example 4 - Restricted code
s.run( "process.platform", function(error, result) {
  console.log( "Example 4: " + result + "\n" )
})

// Example 5 - Infinite loop
// A different sandbox is used for this example because the following ones
// end up being run before this one is finished otherwise
var sb = new Sandbox();
sb.run( "while (true) {}", function(error, result) {
  console.log( "Example 5: " + error + "\n" )
})

// Example 6 - Caller Attack Failure
s.run( "(function foo() {return foo.caller.caller;})()", function(error, result) {
  console.log( "Example 6: " + result + "\n" )
})

// Example 7 - Argument Attack Failure
s.run( "(function foo() {return [].slice.call(foo.caller.arguments);})()", function(error, result) {
  console.log( "Example 7: " + result + "\n" )
})

// Example 8 - Type Coersion Attack Failure
s.run( "(function foo() {return {toJSON:function x(){return x.caller.caller.name}}})()", function(error, result) {
  console.log( "Example 8: " + result + "\n" )
})

// Example 9 - Global Attack Failure
s.run( "x=1;(function() {return this})().console.log.constructor('return this')()", function(error, result) {
  console.log( "Example 9: " + result + "\n" )
})

// Example 10 - Console Log
s.run( "var x = 5; console.log('Example 10: ' + (x * x)); x", function(error, result) {})

// Example 11 - IPC Messaging
s.run( "onmessage = function(message){ if (message === 'hello from outside') { postMessage('hello from inside'); process.exit(); };", function(error, result){

})
s.on('message', function(message){
  console.log("Example 11: received message sent from inside the sandbox '" + message + "'\n")
});
var test_message = "hello from outside";
console.log("Example 11: sending message into the sandbox '" + test_message + "'");
s.postMessage(test_message);
