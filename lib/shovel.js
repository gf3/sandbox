// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var util = require( 'util' )
  , broadway = require('broadway')
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

var options= JSON.parse(process.argv[3])
options.sandbox = sandbox = {};
var app = new broadway.App();
options.forEach(function(o) {app.use(o.plugin, o.options)})
/*  { console:
    { log: function() { var i, l
        for ( i = 0, l = arguments.length; i < l; i++ )
          console.push( util.inspect( arguments[i] ) )
      }
    }
  }
sandbox.print = sandbox.console.log*/

// Get code
code = ''
stdin = process.openStdin()
stdin.on( 'data', function( data ) {
  code += data
})
stdin.on( 'end', run )

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
  
  process.stdout.on( 'drain', function() {
    process.exit(0)
  })
  process.stdout.write( JSON.stringify( { result: util.inspect( result ), console: console } ) )
}

