// sandbox.js - Rudimentary Javascript Sandbox

/*------------------------- INIT -------------------------*/
var fs = require( 'fs' )
  , path = require( 'path' )
  , spawn = require( 'child_process' ).spawn

/*------------------------- Sandbox -------------------------*/
function Sandbox( options ) {
  ( this.options = options || {} ).__proto__ = Sandbox.options
  
  this.run = function( code, hollaback ) {
    // Any vars in da house?
    var timer
      , stdout = ''
      , args = this.options.api ? [this.options.shovel, this.options.api] : [this.options.shovel]
      , child = spawn( this.options.node, args )
      , output = function( data ) {
          if ( !!data )
            stdout += data
        }
    
    // Listen
    child.stdout.on( 'data', output )
    child.on( 'exit', function( code ) {
      clearTimeout( timer )
      setImmediate(function(){
        hollaback.call( this, JSON.parse( stdout ) )
      })
    })
    
    // Go
    child.stdin.write( code )
    child.stdin.end()
    timer = setTimeout( function() {
      child.stdout.removeListener( 'output', output )
      stdout = JSON.stringify( { result: 'TimeoutError', console: [] } )
      child.kill( 'SIGKILL' )
    }, this.options.timeout )
  }
}

// Options
Sandbox.options =
  { timeout: 1500
  , node: 'node'
  , shovel: path.join( __dirname, 'shovel.js' )
  }

// Info
fs.readFile( path.join( __dirname, '..', 'package.json' ), function( err, data ) {
  if ( err )
    throw err
  else
    Sandbox.info = JSON.parse( data )
})

/*------------------------- Export -------------------------*/
module.exports = Sandbox

