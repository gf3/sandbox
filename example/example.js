var Sandbox = require("../lib/sandbox")
  , s = new Sandbox()

// Example 1 - Standard JS
s.run( "1 + 1", function( output ) {
  console.log( "Example 1: " + output.result + "\n" )
})

// Example 2 - Something slightly more complex
s.run( "(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", function( output ) {
  console.log( "Example 2: " + output.result + "\n" )
})

// Example 3 - Syntax error
s.run( "lol)hai", function( output ) {
  console.log( "Example 3: " + output.result + "\n" )
});

// Example 4 - Restricted code
s.run( "process.platform", function( output ) {
  console.log( "Example 4: " + output.result + "\n" )
})

// Example 5 - Infinite loop
s.run( "while (true) {}", function( output ) {
  console.log( "Example 5: " + output.result + "\n" )
})

