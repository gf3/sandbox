// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var util = require( 'util' )
  , broadway = require('broadway')
  , path = require( 'path' )
  , code
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
console.log = function (d) {
  var args = Array.prototype.map.call(arguments, function(arg){return util.inspect(arg)})
  process.stdout.write(args.join(' ') + '\n');
};
//console.log ("child process:" , process)
process.parent.on("sandbox::start", start)

function start(options) {
  options= options || [];
console.log("options:", options)

  var app = new broadway.App();
  app.sandbox = sandbox = {};

  options.forEach(function(o) {app.use(o.plugin, o.options)})

  // Run code
  function run() {
    result = (function() {
      try {
        return Script.runInNewContext( this.toString(), sandbox )
      }
      catch (e) {
        return e.name + ': ' + e.message
      }
    }).call( code )
    process.parent.emit("sandbox::result", result);
    
    process.stdout.on( 'drain', function() {
      process.exit(0)
    })
//    process.stdout.write( JSON.stringify( { result: util.inspect( result ) } ) )
  }
}
