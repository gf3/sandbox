// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var util = require( 'util' )
  , code
  , result
  , console
  , stdin
  , Script = process.binding('evals').Script
  , sandbox

/* ------------------------------ Sandbox ------------------------------ */
// Sandbox methods
console = []
sandbox =
  { console:
    { log: function() { var i, l
        for ( i = 0, l = arguments.length; i < l; i++ )
          console.push( util.inspect( arguments[i] ) )
      }
    }
  }
sandbox.print = sandbox.console.log

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
      return Script.runInNewContext( this.toString().replace( /\\([rn])/g, "\\\\$1" ), sandbox )
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

