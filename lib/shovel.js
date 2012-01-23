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
//console.log('start'.bold.red)
  options = options || {name:'Sandbox', plugins: []};
// console.log("options:", options)

  var app = new broadway.App()
  app.sandbox = options.sandbox = {} 
    
  app.IAmChild = true
  app.parent = process.parent
//  app.console = console
  app.options = options
  options.plugins.forEach(function(plugin) {
    var toUse = plugin.plugin || require(plugin.path)
    if(toUse)
      app.use(toUse, plugin.options || {})
    })

//  console.log('shovel plugins loaded :\n'.bold, Object.keys(app.plugins))
//  console.log('used sandbox : ', app.sandbox)  

//  app.onAny(function(){console.log('-> '.bold, this.event.bold)})
//  process.parent.onAny(function(){console.log('-> '.bold.yellow, this.event.bold.yellow)})
  
  app.init()
console.log('app init'.bold.red)
  app.parent.ready(function() {
    // ---- parent <-> app event relay ----
    app.parent.on("shovel::**", function relaySandboxEvent(){
//console.log('sandbox ------', this.event, '----> shovel')
      if(this.eventSource === app.parent)
        return;
      this.eventSource = app.parent
      app.emit.apply(app, [this.event].concat(Array.prototype.slice.call(arguments)))
      delete this.eventSource;
    })
    app.on("sandbox::**", function relayShovelEventToSandbox(){
      if(this.eventSource === app.parent)
        return;
//console.log('shovel ------', this.event, '----> sandbox')
      this.eventSource = app
      app.parent.emit.apply(app.parent, [this.event].concat(Array.prototype.slice.call(arguments)))
      delete this.eventSource;
    })
    
    // -----------------------------------
    
    // Load user main code
    var stack = stackedy(code, { filename : '<your code>' })
    
    // Load extra code
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
    
    // Run code
console.log('app run'.bold.red)
    app.runner = stack.run(app.sandbox, {stopppable:true})
console.log('app runnning'.bold.red)
//    app.runner
    app.runner.return = Futures.future(app)
    
    app.emit("shovel::runner::run", app.runner)
    app.emit("shovel::run", app.runner.source)
    
    app.runner
      .on('error', function onError (err, c) {
        app.emit("shovel::runner::error", app.runner, err, c)
        app.runner.return.deliver(refineStack(err, c))
      })
      .on('result', function onResult (result) {
        app.emit("shovel::runner::result", app.runner, result)
        app.sandbox.exports;
        app.runner.return.deliver(null, result, app.sandbox.exports)
      })
      .on('stop', function onStop() {
        console.log('runner has stopped')
        console.log('result ?'.bold.cyan, app.runner.nodes)
        app.emit("shovel::runner::stopped", app.sandbox)
      })
    
    app.runner.return.when(function onReturn(err, result, exports) {
    console.log('app return'.bold.red)
      app.emit("shovel::runner::return", err, result, exports)
    })
    

    app.on("shovel::exit", function onShovelExit() {
      app.emit("shovel::runner::kill")
      //TODO maybe act on return ?
      /*process.nextTick(function() {
        process.exit(0)
      })*/
    })
    
    app.on("shovel::runner::kill", function onRunnerKill() {
      app.runner.stop()
    })
    
    app.on("shovel::runner::stopped", function onRunnerStopped() {
      app.emit("shovel::stopped")
      /*process.nextTick(function() {
        process.exit(0)
      })*/
    })
  })
  
  /*function status () {console.log('not running'.bold.red, app.runner)}
  console.log('running'.bold.green, app.runner)
  process.nextTick(function() {
    console.log('first tick'.bold.yellow, app.runner)
    process.nextTick(function() {
      console.log('second tick'.bold.yellow, app.runner)
    })
  })*/
  setTimeout(function getStatus() {
    if(!app.runner) {
      console.log('---probably running---\n'.bold.green)
    }
    else {
      console.log('---probably stopped---\n'.bold.yellow, app && app.runner)
      
    }
    app.runner.stop()
  }, 10)
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

function resultFilter (source) {
  src = source.split('\n');
  src.pop()
}

