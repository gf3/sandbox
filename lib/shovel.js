// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var sys = require('sys')
  , code = ''
  , reserved =
      { 'require': null
      , '__filename': null
      , '__module': null
      , 'module': null
      , 'code': null
      , 'reserved': null
      , 'run': null
      , 'sys': null
      }
    ;

/* ------------------------------ Sandbox ------------------------------ */
// Generate list of reserved items
for (var i in GLOBAL) reserved[i] = null;

// Get code
var stdin = process.openStdin();
stdin.addListener('data', function(data) {
  code += data;
});
stdin.addListener('end', run);

// Run code
function run() {
  var output = (function() {
    try {
      with (reserved) { return eval(this.toString()); };
    }
    catch (e) {
      return e.name + ': ' + e.message;
    }
  }).call(code);
  
  process.stdout.addListener('drain', function() {
    process.exit(0);
  });
  process.stdout.write(sys.inspect(output));
}

