// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010

/*------------------------- INIT -------------------------*/
require('colors')
var fs = require( 'fs' )
  , path = require( 'path' )
  , broadway = require('broadway')

var Child = require('intercom').EventChild

/*------------------------- Sandbox -------------------------*/
function Sandbox( options ) {
  ( this.options = options || {} ).__proto__ = Sandbox.options
  
  var app = new broadway.App();
  (this.options.plugins || []).forEach(function(o) {app.use(require(o.plugin), o.options)})
  console.log('sandbox plugins loaded : '.bold, app)
  
  this.run = function( code, hollaback ) {
    // Any vars in da house?
    var child = app.child = Child( this.options.shovel, this.options )
    
    // Listen
    child.on('stdout', function(txt) {
      console.log('child stdout> '.bold.blue, ""+txt);
    });

    child.on('stderr', function(txt) {
      console.log('child stderr> '.bold.yellow, ""+txt);
    });
    
    child.on("sandbox::error", function(err) {
      console.log('Sandbox error:'.bold.red, err)
      child.emit("sandbox::exit")
      hollaback(err)
    })
    
    child.on("sandbox::return", function(result) {
      console.log('Sandbox result:'.bold.green, result)
      child.emit("sandbox::exit")
      hollaback(null, result)
    })
    
    child.ready(function(err) {
      if(err)
        throw err;

    // Go
//console.log("options", [{plugin: path.join( __dirname, 'plugins/console.js' ), options:{}}])
      child.emit("sandbox::start", [{plugin: path.join( __dirname, 'plugins/console.js' ), options:{}}], code)
      

    
    });
    
    child.start()

  }
}

// Options
Sandbox.options =
  { timeout: 500
  , shovel: path.join( __dirname, 'shovel.js' )
  , plugins: [{plugin: path.join( __dirname, 'plugins/console.js' ), options:{}}]
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

