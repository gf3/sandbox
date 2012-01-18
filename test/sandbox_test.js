/* ------------------------------ INIT ------------------------------ */
require('should')

var Sandbox = require('../lib/sandbox')
  , sb = new Sandbox()

/* ------------------------------ Tests ------------------------------ */
// it should execute basic javascript
sb.run( '1 + 1', function( output ) {
  output.result.should.eql("2")
})


// it should gracefully handle syntax errors
sb.run( 'hi )there', function( output ) {
  output.result.should.eql("'SyntaxError: Unexpected token )'")
})


// it should effectively prevent code from accessing node
sb.run( 'process.platform', function( output ) {
  output.result.should.eql("'ReferenceError: process is not defined'")
})


// it should effectively prevent code from circumventing the sandbox
sb.run( "var sys=require('sys'); sys.puts('Up in your fridge')", function( output ) {
  output.result.should.eql("'ReferenceError: require is not defined'")
})


// it should timeout on infinite loops
sb.run( 'while ( true ) {}', function( output ) {
  output.result.should.eql("TimeoutError")
})


// it should allow console output via `console.log`
sb.run( 'console.log(7); 42', function( output ) {
  output.result.should.eql("42")
  output.console[0].should.eql(7)
})


// it should allow console output via `print`
sb.run( 'print(7); 42', function( output ) {
  output.result.should.eql("42")
  output.console[0].should.eql(7)
})


// it should maintain the order of sync. console output
sb.run( 'console.log("first"); console.log("second"); 42', function( output ) {
  output.result.should.eql("42")
  output.console[0].should.eql("first")
  output.console[1].should.eql("second")
})

