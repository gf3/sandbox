// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var util = require( 'util' )
  , broadway = require('broadway')
  , path = require( 'path' )
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
console.debug = console.log = console.error = function (d) {
  var args = Array.prototype.map.call(arguments, function(arg){return util.inspect(arg)})
  process.stdout.write(args.join(' ') + '\n');
};

process.parent.on("sandbox::start", start)
process.parent.on("child::exit", function(result) {
  process.exit(0)
})

function start(options, code) {
  options = options || [];
console.log("options:", options)

  var app = new broadway.App()
  app.sandbox = sandbox = {}

  options.forEach(function(o) {app.use(require(o.plugin), o.options)})
console.log('shovel plugins loaded : ', app)
  // Run code
  run();
  
  function run() {
    result = (function() {
      try {
        return Script.runInNewContext( this.toString(), sandbox )
      }
      catch (e) {
        process.parent.emit("sandbox::error", e)
        return undefined
      }
    }).call( code )
    
    process.parent.emit("sandbox::return", result);
    

//    process.stdout.write( JSON.stringify( { result: util.inspect( result ) } ) )
  }
}
