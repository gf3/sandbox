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
  this.options = (options || {});
  var self = this;
  //this.options.__proto__ = Sandbox.options;

  Object.keys(Sandbox.options).forEach(function(key){
    self.options[key] = self.options[key] || Sandbox.options[key];
  })
  

  
  var app = new broadway.App();
  app.IAmParent = true;

  app.console = console;
  app.options = this.options;
  this.name = app.name = this.options.name;
  
  app.options.plugins.forEach(function(plugin) {
    var toUse = plugin.plugin || require(plugin.path)
    if(toUse)
      app.use(toUse, plugin.options || {})
    })
  
  
  this.run = function run ( code, hollaback ) {
    // Any vars in da house?
    var child = app.child = Child( this.options.shovel, this.options )
    app.IAmParent = true;
    app.init()
    //console.log('sandbox plugins loaded :\n'.bold, Object.keys(app.plugins))
    
    // Listen
    child.on('stdout', function(txt) {
      console.log((self.options.name + ' stdout> ').bold.blue, ""+txt)
    })

    child.on('stderr', function(txt) {
      console.log((self.options.name + ' stderr> ').bold.yellow, ""+txt)
    })
    
    /*child.on("sandbox::error", function(err) {
      //console.log('Sandbox error:'.bold.red, err.refinedStack )
      child.emit("shovel::exit")
      hollaback(err)
    })*/
    
    child.on("sandbox::return", function(err, result) {
      //console.log('Sandbox result:'.bold.green, result)
//      console.log("child", child)
      child.emit("shovel::exit")
      hollaback(err, result)
      child.stop()
    })
    
    
    child.ready(function(err) {
      if(err)
        throw err;
      // Go
      child.emit("shovel::start", self.options, code)
    })
    
    child.start()
    this.stop = child.stop.bind(child)

  }
}

// Options
Sandbox.options =
  { name: 'Sandbox'
//  , timeout: 50
  , shovel: path.join( __dirname, 'shovel.js' )
  , plugins: [
      {path: path.join( __dirname, 'plugins/console.js' ), options:{}},
      {path: path.join( __dirname, 'plugins/timeout.js' ), options:{}}
    ]
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

