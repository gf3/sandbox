// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010

/*------------------------- INIT -------------------------*/
var sys = require( 'sys' )
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
    child.stdout.addListener( 'data', output )
    child.addListener( 'exit', function( code ) {
      clearTimeout( timer )
      hollaback.call( this, stdout )
    })
    
    // Go
    child.stdin.write( code )
    child.stdin.end()
    timer = setTimeout( function() {
      child.stdout.removeListener( 'output', output )
      child.stdout.removeListener( 'exit', output )
      stdout = 'TimeoutError'
      child.kill( 'SIGHUP' )
    }, this.options.timeout )
  }
}

// Options
Sandbox.options =
  { timeout: 500
  , node: 'node'
  , shovel: (function() {
      var p = __filename.split('/').slice( 0, -1 )
      p.push( 'shovel.js' )
      return p.join('/')
    })()
  }

/*------------------------- Export -------------------------*/
module.exports = Sandbox

