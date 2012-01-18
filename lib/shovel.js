// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010
process.title = 'shovel'
/* ------------------------------ INIT ------------------------------ */
require('colors')
var util = require( 'util' )
  , broadway = require('broadway')
  , path = require( 'path' )
  , stackedy = require('stackedy')
  , Futures = require('futures')
  , console
  , result
  , sandbox
  , Script
  , stdin

if ( ! ( Script = process.binding( 'evals').NodeScript ) )
  Script = process.binding('evals').Script

/* ------------------------------ Sandbox ------------------------------ */
// Sandbox methods

var console={}
console.debug = console.log = console.error = function () {
  var args = Array.prototype.map.call(arguments, function(arg){
    return typeof arg === "string" ?
      arg :
      (typeof arg === "undefined"?
        "undefined" :
        util.inspect(arg))
      })
  process.stdout.write(args.join(' ') + '\n')
};

process.parent.on("shovel::start", start)

function start(options, code) {
  options = options || {name:'Sandbox', plugins: []};
// console.log("options:", options)

  var app = new broadway.App()
  app.sandbox = options.sandbox = {} /*= sandbox = {
   t:setTimeout,
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval}*/
    
  app.IAmChild = true
  app.console = console
  app.options = options
  options.plugins.forEach(function(plugin) {
    var toUse = plugin.plugin || require(plugin.path)
    if(toUse)
      app.use(toUse, plugin.options || {})
    })
  app.init()

//  console.log('shovel plugins loaded :\n'.bold, Object.keys(app.plugins))
//  console.log('used sandbox : ', app.sandbox)
  

  //app.onAny(function(){console.log('-> '.bold, this.event.bold, arguments)})
  //process.parent.onAny(function(){console.log('-> '.bold.yellow, this.event.bold.yellow, arguments)})
  
  process.parent.ready(function() {
    process.parent.on("shovel::*", function relaySandboxEvent(){
      if(this.eventSource === process.parent)
        return;
      this.eventSource = process.parent
      app.emit.apply(app, [this.event].concat(Array.prototype.slice.call(arguments)))
      delete this.eventSource;
    })
    app.on("sandbox::*", function relayRunnerEvent(){
      if(this.eventSource === process.parent)
        return;
      this.eventSource = app
      process.parent.emit.apply(process.parent, [this.event].concat(Array.prototype.slice.call(arguments)))
      delete this.eventSource;
    })
    
      // Run code  
    var stack = stackedy(code, { filename : '<your code>' })
    app.extracode = []
    app.emit("shovel::code::extra", function pushExtraCode(filename, code, opts) {
      if(typeof filename != 'string')
        throw Error('Invalid extra code filename (bad plugin?) : <'+filename+'> is not a String')
      if(typeof code != 'string')
        throw Error('Invalid extra code loaded (bad plugin?) : <'+code+'> is not a String')
      opts = opts || {}
      opts.filename = filename
      stack.include(code, opts)
    })
    app.runner = stack.run(app.sandbox)
    
    app.runner.on('stop', function() {
      console.log('runner has stopped')
      app.emit("runner::stopped", app.sandbox)
    })
    app.runner.return = Futures.future(app)
    app.emit("sandbox::run", app.runner.source)
    
    app.emit("runner::run", app.runner)

    
    app.runner.on('error', function onError (err, c) {
        app.emit("runner::error", app.runner, err, c)
        app.runner.return.deliver(refineStack(err, c))
      }).on('result', function onResult (result) {
        app.emit("runner::result", app.runner, result)
        app.sandbox.exports;
        app.runner.return.deliver(null, result, app.sandbox.exports)
    })
    
    app.runner.return.when(function onReturn(err, result, exports) {
      app.emit("sandbox::return", err, result, exports)
      //app.runner.stop()
    })
    

    app.on("shovel::exit", function() {
      app.emit("runner::kill")
      process.nextTick(function() {
        process.exit(0)
      });
    })
    
    app.on("runner::kill", function() {
      app.runner.stop()
    })
  })
    
  return this
}

function refineStack(err, c) {
  var cur = c.current || {filename:'<your code>', start:{}},
    message = err.message,
    stack =  message +
      '\n  in ' + (cur.filename || '<your code>') + 
      (cur.functionName ? ' at ' + cur.functionName +'()' : '') +
      ((cur && cur.start && cur.start.line !== undefined && cur.start.col !== undefined)?
        ' at ' + cur.start.line + ':' + cur.start.col : '');

  c.stack.forEach(function (cur) {
    cur = cur || {filename:'<your code>', start:{}};
    stack +='\n  in ' + cur.filename + '.' +
      (cur.functionName ? cur.functionName +'()' : '<anonymous>()') +
      ((cur && cur.start && cur.start.line !== undefined && cur.start.col !== undefined )?
        ' at ' + cur.start.line + ':' + cur.start.col : '')
  })
  err.refinedStack = stack;
  return err;
}

