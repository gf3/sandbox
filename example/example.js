var Sandbox = require("../lib/sandbox")
  , s = new Sandbox()

// Example 1 - Standard JS
s.run( "1 + 1", function( err, result ) {
  console.log( "Example 1: " + result + "\n" )
})

// Example 2 - Something slightly more complex
s.run( "(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", function( err, result ) {
  console.log( "Example 2: " + result + "\n" )
})

// Example 3 - Syntax error
s.run( "lol)hai", function( err, result ) {
  console.log( "Example 3: " + result + "\n" )
});

// Example 4 - Restricted code
s.run( "process.platform", function( err, result ) {
  console.log( "Example 4: " + result + "\n" )
})

s.run( "console.log('hello, world')", function( err, result ) {
  console.log( "Example 4: " + result + "\n" )
})

// Example 5 - Infinite loop
s.run( "while (true) {}", function( err, result ) {
  console.log( "Example 5: " + result + "\n" )
})

