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
		hollaback= hollaback || function(err, result, exports) {
			if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
			console.log( this.name.bold.green, 'result:'.bold.green, result, 'exports:'.bold.green, exports )
		}
    // Any vars in da house?
    hollaback = hollaback.bind(app);
    
    var child = app.child = Child( this.options.shovel, this.options.intercom )
    app.IAmParent = true;
    app.init()
    
//    app.onAny(function(){console.log('-> '.bold.green, this.event.bold)})
//    child.onAny(function(){console.log('-> '.bold.cyan, (this.event||'???').bold)})
    
    // ---- child <-> app event relay ----
    

    child.ready(function(err) {
      if(err)
        throw err;
      app.emit("shovel::ready")
      
      app.on("shovel::**", function relaySandboxEvent(){
//console.log('sandbox ------', this.event, '----> shovel')
        if(this.eventSource === app)
          return;
        this.eventSource = app
        try{child.emit.apply(child, [this.event].concat(Array.prototype.slice.call(arguments)))} catch(e) {
          console.warn(this.name.yellow, 'Event'.yellow, this.event.bold.yellow, 'could not been send to shovel as it was shutdown'.yellow)
        }
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
      //child.child._channel.on('error', function(err){child.emit('warn', err)})
      child.emit("shovel::start", app.options, code)
    })
    
    // -----------------------------------
    
    //console.log('sandbox plugins loaded :\n'.bold, Object.keys(app.plugins))
    
    // Listen for any output


    function onExit(){
      app.emit("sandbox::shovel::stopped")
      var err = Error("Sandbox process was shutdown")
      err.refinedStack = "Sandbox was shutdown, probably because you have reached a sandbox limit (memory, CPU) with your code"
      app.emit("sandbox::return", err)
    }
    
    child.on('exit', onExit)
    
    app.on("sandbox::shovel::return", function(err, result, exports) {
      app.emit("sandbox::return", err, result, exports)
    })
    
    app.on("sandbox::return", function(err, result, exp) { 
      child.off('exit', onExit)
      hollaback(err, result, exp)
      if(err)
        app.emit("sandbox::error", err)
      else
        app.emit("sandbox::result", result)
        
      app.emit("sandbox::result::exports", exports)
    })
    
    app.on("shovel::kill", function(signal) {
      
      signal = signal || 'sigterm'
      if(child && child.child && child.child.kill) {
        console.log(this.name.red, 'kill :'.red, signal)
        try {child.child.kill(signal)} catch (e) { }
      }
    })
    
    app.on("sandbox::stop", function(signal) {
      child.stop();
    })
    
    app.on("sandbox::kill", function(signal) {
      app.emit("shovel::kill", signal)
    })
    process.setMaxListeners(100)
    process.on('exit', function(){child.stop()})
    child.start()
//    console.log('child'.bold.yellow, child)
    app.stop = child.stop.bind(child)

    app.debugEvents = function debug() {
      app.onAny(function() {
      if(this.event !== "sandbox::shovel::stdout" && this.event !== "sandbox::console")
        console.log(this.name, this.event.cyan, arguments)
      })
      return app;
    }
    return app;
  }
}

Sandbox.plugins = {};
Sandbox.plugins.globals  = {path: './plugins/globals.js' , options:{}}
Sandbox.plugins.console  = {path: './plugins/console.js' , options:{}}
Sandbox.plugins.timeout  = {path: './plugins/timeout.js' , options:{}}
Sandbox.plugins.cpulimit = {path: './plugins/cpulimit.js', options:{}}
Sandbox.plugins.module   = {path: './plugins/module.js'  , options:{}}
Sandbox.plugins.request  = {path: './plugins/request.js' , options:{}}
Sandbox.plugins.invoke   = {path: './plugins/invoke.js'  , options:{}}
Sandbox.plugins.stdout   = {path: './plugins/stdout.js'  , options:{}}

// Options
Sandbox.options =
  { name: 'Sandbox'
  , shovel: path.join( __dirname, 'shovel.js' )
  , intercom: {forever : false, max: 1}
  , plugins: [
      Sandbox.plugins.globals,
      Sandbox.plugins.console,
      Sandbox.plugins.timeout,
      Sandbox.plugins.cpulimit,
      Sandbox.plugins.module,
      Sandbox.plugins.request,
      Sandbox.plugins.stdout
    ]
  }


/*------------------------- Export -------------------------*/
module.exports = Sandbox

