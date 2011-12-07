// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010

/*------------------------- INIT -------------------------*/
var fs = require( 'fs' )
  , path = require( 'path' )
  , broadway = require('broadway')
//  , spawn = require( 'child_process' ).spawn

var Child = require('intercom').EventChild

/*------------------------- Sandbox -------------------------*/
function Sandbox( options ) {
  ( this.options = options || {} ).__proto__ = Sandbox.options
  
  var app = new broadway.App();
  
  this.run = function( code, hollaback ) {
    // Any vars in da house?
    var timer
      , stdout = ''
//      , child = spawn( this.options.node, [this.options.shovel, JSON.stringify(this.options)] )
      , child = app.child = Child( this.options.shovel, this.options )
      , output = function( data ) {
          if ( !!data )
            stdout += data
        }
    
    // Listen
    //child.on( 'stdout', console.log/*output*/ )
    child.on( 'exit', function( code ) {
      clearTimeout( timer )
      hollaback.call( this, JSON.parse( stdout ) )
    })
    child.on('stdout', function(txt) {
      console.log('child stdout> ', ""+txt);
    });

    child.on('stderr', function(txt) {
      console.log('child stderr> ', ""+txt);
    });
    
    child.on("sandbox::parent", function(result) {
      console.log('Sandbox result:', result)
      hollaback(result)
    })
    
    child.start()
//    console.log('child =>',child)
    child.ready(function(err){
      if(err)
        throw err;

    // Go
//      child.child.stdin.write( code )
//      child.child.stdin.end()
console.log("options", [{plugin: path.join( __dirname, 'plugins/console.js' ), options:{}}])
      child.emit("sandbox::start", [{plugin: path.join( __dirname, 'plugins/console.js' ), options:{}}], code)
      
      timer = setTimeout( function() {
//        child.stdout.removeListener( 'output', output )
        stdout = JSON.stringify( { result: 'TimeoutError', console: [] } )
        child.kill( 'SIGKILL' )
      }, this.options.timeout )
    
    });
  }
}

// Options
Sandbox.options =
  { timeout: 500
  , shovel: path.join( __dirname, 'shovel.js' )
  , plugins: [{file: path.join( __dirname, 'plugins/console.js' ), options:{}}]
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

