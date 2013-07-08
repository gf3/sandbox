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
      , child = spawn( this.options.node, [this.options.shovel] )
      , output = function( data ) {
          if ( !!data )
            stdout += data
        }
    
    // Listen
    child.stdout.on( 'data', output )
    child.on( 'exit', function( code ) {
      clearTimeout( timer )
      try{
        hollaback.call( this, JSON.parse( stdout ) )
      }
      catch(err){
        console.log("Malformed stdout. ERR : " + err)
      }
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
  { timeout: 500
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

