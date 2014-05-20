// shovel.js - Do the heavy lifting in this sandbox

/* ------------------------------ INIT ------------------------------ */
var util = require( 'util' )
  , code
  , result
  , console
  , sandbox
  , Script
  , stdin
  , apiContext = {};

// Optionally provide an API that the untrusted code
// will have access to.
if (process.argv[2]) {
  apiContext = require(process.cwd() + '/' + process.argv[2].replace('.js', ''));
}

if ( ! ( Script = process.binding( 'evals').NodeScript ) )
  if ( ! ( Script = process.binding('evals').Script ) )
    Script = require( 'vm' );

/* ------------------------------ Sandbox ------------------------------ */
var console = [];

// Get code
code = '';
stdin = process.openStdin();
stdin.on( 'data', function( data ) {
  code += data;
})
stdin.on( 'end', run );

function getSafeRunner() {
  var global = this;
  // Keep it outside of strict mode
  function UserScript(str) {
    // We want a global scoped function that has implicit returns.
    return Function('return eval('+JSON.stringify(str+'')+')');
  }
  // place with a closure that is not exposed thanks to strict mode
  return function run(comm, src) {
    // stop argument / caller attacks
    "use strict";
    var send = function send(event) {
      "use strict";
      //
      // All comm must be serialized properly to avoid attacks, JSON or XJSON
      //
      comm.send(event, JSON.stringify([].slice.call(arguments,1)));
    }
    global.print = send.bind(global, 'stdout');
    global.console = {};
    global.console.log = send.bind(global, 'stdout');
    var result = UserScript(src)();
    send('end', result);
  }
}

wat = 0
// Run code
function run() {
  var context = Script.createContext(apiContext);
  var safeRunner = Script.runInContext('('+getSafeRunner.toString()+')()', context);
  var result;
  try {
    safeRunner({
      send: function (event, value) {
        "use strict";

        switch (event) {
          case 'stdout':
            console.push(JSON.parse(value)[0]);
            break;
          case 'end':
            result = JSON.parse(value)[0];
            break;
        }
      }
    }, code);
  }
  catch (e) {
    result = e.name + ': ' + e.message;
  }
  
  process.on('exit', function() {
    process.stdout.write( JSON.stringify( { result: util.inspect( result ), console: console } ) );
  });
}

