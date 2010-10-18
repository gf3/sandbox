// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var sys = require('sys')
  , code = ''
  , i
  , stdin
  , reserved =
    { 'require': undefined
    , '__filename': undefined
    , '__module': undefined
    , 'module': undefined
    , 'code': undefined
    , 'reserved': undefined
    , 'run': undefined
    , 'sys': undefined
    , 'i': undefined
    , 'stdin': undefined
    }

/* ------------------------------ Sandbox ------------------------------ */
// Generate list of reserved items
for ( i in GLOBAL )
  reserved[i] = undefined

// Get code
stdin = process.openStdin()
stdin.addListener( 'data', function( data ) {
  code += data
})
stdin.addListener( 'end', run )

// Run code
function run() {
  var output = (function() {
    try {
      with ( reserved )
        return eval( this.toString() )
    }
    catch (e) {
      return e.name + ': ' + e.message
    }
  }).call( code )
  
  process.stdout.addListener( 'drain', function() {
    process.exit(0)
  })
  process.stdout.write( sys.inspect( output ) )
}

