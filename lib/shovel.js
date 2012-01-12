// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

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
process.parent.on("shovel::exit", function(result) {
  process.nextTick(function() {
    process.exit(0)
  });
})

function start(options, code) {
  options = options || {name:'Sandbox', plugins: []};
// console.log("options:", options)

  var app = new broadway.App()
  app.sandbox = sandbox = {}
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
    app.runner = stackedy(code, { filename : '<your code>' }).run(sandbox, {global: sandbox, stoppable: true})
    app.runner.return = Futures.future(app)
    app.emit("sandbox::run")
    app.emit("runner::run", app.runner)
      
    app.runner.on('error', function onError (err, c) {
      app.emit("runner::error", app.runner, err, c)
      app.runner.return.deliver(refineStack(err, c))
            }).on('result', function onResult (result) {
      app.emit("runner::result", app.runner, result)
      app.runner.return.deliver(null, result)
    })
    
    app.runner.return.when(function onReturn(err, result) {
      app.emit("sandbox::return", err, result)
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
      (cur.functionName ? cur.functionName +'()' : '<anonymous>') +
      ((cur && cur.start && cur.start.line !== undefined && cur.start.col !== undefined )?
        ' at ' + cur.start.line + ':' + cur.start.col : '')
  })
  err.refinedStack = stack;
  return err;
}

