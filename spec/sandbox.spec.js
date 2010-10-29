/* ------------------------------ INIT ------------------------------ */
var Sandbox = require( '../lib/sandbox' )
  , sb = new Sandbox()

/* ------------------------------ Tests ------------------------------ */
exports['it should execute basic javascript'] = function( test ) {
  sb.run( '1 + 1', function( output ) {
    test.equal( output.result, '2' )
    test.finish()
  })
}

exports['it should gracefully handle syntax errors'] = function( test ) {
  sb.run( 'hi )there', function( output ) {
    test.equal( output.result, "'SyntaxError: Unexpected token )'" )
    test.finish()
  })
}

exports['it should effectively prevent code from accessing node'] = function( test ) {
  sb.run( 'process.platform', function( output ) {
    test.equal( output.result, "'ReferenceError: process is not defined'" )
    test.finish()
  })
}

exports['it should effectively prevent code from circumventing the sandbox'] = function( test ) {
  sb.run( "var sys=require('sys'); sys.puts('Up in your fridge')", function( output ) {
    test.equal( output.result, "'ReferenceError: require is not defined'" )
    test.finish()
  })
}

exports['it should timeout on infinite loops'] = function( test ) {
  sb.run( 'while ( true ) {}', function( output ) {
    test.equal( output.result, "TimeoutError" )
    test.finish()
  })
}

exports['it should allow console output via `console.log`'] = function( test ) {
  sb.run( 'console.log(7); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "7" )
    test.finish()
  })
}

exports['it should allow console output via `print`'] = function( test ) {
  sb.run( 'print(7); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "7" )
    test.finish()
  })
}

exports['it should maintain the order of sync. console output'] = function( test ) {
  sb.run( 'console.log("first"); console.log("second"); 42', function( output ) {
    test.equal( output.result, "42" )
    test.equal( output.console[0], "'first'" )
    test.equal( output.console[1], "'second'" )
    test.finish()
  })
}

/* ------------------------------ GO GO GO ------------------------------ */
if ( module == require.main )
  require( 'async_testing' ).run( __filename, process.ARGV )

