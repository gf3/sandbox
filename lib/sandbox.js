// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010
process.title = 'sandbox'
/*------------------------- INIT -------------------------*/
require('colors')
var fs = require( 'fs' )
  , path = require( 'path' )
  , broadway = require('broadway')

var Child = require('intercom').EventChild

/*------------------------- Sandbox -------------------------*/
function Sandbox( options ) {
  if(! (this instanceof Sandbox))
    return (new Sandbox(options))
  
  this.options = (options || {});
  if(typeof this.options === "string")
    this.options = {name: this.options}
  var self = this;
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
  
  
  this.run = app.run = function run ( code, hollaback ) {
    // Any vars in da house?
    hollaback = hollaback.bind(this);
    
    var child = app.child = Child( this.options.shovel, this.options )
    app.IAmParent = true;
    app.init()
    
//    app.onAny(function(){console.log('-> '.bold.green, this.event.bold)})
//    child.onAny(function(){console.log('-> '.bold.cyan, (this.event||'???').bold.yellow)})
    
    // ---- child <-> app event relay ----
    

    child.ready(function(err) {
      if(err)
        throw err;
        
      app.on("shovel::**", function relaySandboxEvent(){
//console.log('sandbox ------', this.event, '----> shovel')
        if(this.eventSource === app)
          return;
        this.eventSource = app
        child.emit.apply(child, [this.event].concat(Array.prototype.slice.call(arguments)))
        delete this.eventSource;
      })
      
      child.on("sandbox::**", function relayShovelEventToSandbox(){
//console.log('shovel ------', this.event,  '----> sandbox')
        if(this.eventSource === child)
          return;
        this.eventSource = child
        app.emit.apply(app, [this.event].concat(Array.prototype.slice.call(arguments)))
        delete this.eventSource;
      })
      // Go
      child.emit("shovel::start", app.options, code)
      
    })
    
    // -----------------------------------
    
    //console.log('sandbox plugins loaded :\n'.bold, Object.keys(app.plugins))
    
    // Listen
    child.on('stdout', function(txt) {
      app.emit("sandbox::shovel::stdout", txt)
      console.log((self.options.name + ' stdout> ').bold.blue, ""+txt)
    })

    child.on('stderr', function(txt) {
      app.emit("sandbox::shovel::stderr", txt)
      console.log((self.options.name + ' stderr> ').bold.yellow, ""+txt)
    })
    
    /*child.on("sandbox::error", function(err) {
      //console.log('Sandbox error:'.bold.red, err.refinedStack )
      child.emit("shovel::exit")
      hollaback(err)
    })*/
    
    app.on("shovel::return", function(err, result) {
      app.emit("sandbox::return", err, result)
    })
    
    app.on("sandbox::return", function(err, result) { hollaback(err, result) });
    
    
    app.on("shovel::kill", function(signal) {
      signal = signal || 'sigterm'
      if(child && child.child && child.child.kill)
        child.child.kill()
    })
    
    app.on("sandbox::kill", function(signal) {
      app.emit("shovel::kill", signal)
    })
    
    child.start()
//    console.log('child'.bold.yellow, child)
    app.stop = child.stop.bind(child)

    return app;
  }
}

// Options
Sandbox.options =
  { name: 'Sandbox'
//  , timeout: 50
  , shovel: path.join( __dirname, 'shovel.js' )
  , plugins: [
      {path: path.join( __dirname, 'plugins/console.js' ), options:{}}
     ,{path: path.join( __dirname, 'plugins/timeout.js' ), options:{}}
     ,{path: path.join( __dirname, 'plugins/cpulimit.js' ), options:{}}
     ,{path: path.join( __dirname, 'plugins/module.js' ), options:{}}
     ,{path: path.join( __dirname, 'plugins/request.js' ), options:{}}
    ]
  }


/*------------------------- Export -------------------------*/
module.exports = Sandbox

