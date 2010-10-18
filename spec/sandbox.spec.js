/* ------------------------------ INIT ------------------------------ */
var Sandbox = require( '../lib/sandbox' )
  , sb = new Sandbox()

/* ------------------------------ Tests ------------------------------ */
exports['it should execute basic javascript'] = function( test ) {
  sb.run( '1 + 1', function( output ) {
    test.equal( output, '2' )
    test.finish()
  })
}

exports['it should gracefully handle syntax errors'] = function( test ) {
  sb.run( 'hi )there', function( output ) {
    test.equal( output, "'SyntaxError: Unexpected token )'" )
    test.finish()
  })
}

exports['it should effectively prevent code from accessing node'] = function( test ) {
  sb.run( 'process.platform', function( output ) {
    test.equal( output, "'TypeError: Cannot read property \\'platform\\' of undefined'" )
    test.finish()
  })
}

exports['it should effectively prevent code from circumventing the sandbox'] = function( test ) {
  sb.run( "var sys=require('sys'); sys.puts('Up in your fridge')", function( output ) {
    test.equal( output, "'TypeError: undefined is not a function'" )
    test.finish()
  })
}

exports['it should timeout on infinite loops'] = function( test ) {
  sb.run( 'while ( true ) {}', function( output ) {
    test.equal( output, "TimeoutError" )
    test.finish()
  })
}

if ( module == require.main )
  require( 'async_testing' ).run( __filename, process.ARGV )

