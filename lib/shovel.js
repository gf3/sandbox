var util = require('util');
var vm   = require('vm');

//-----------------------------------------------------------------------------
// Sandbox
//-----------------------------------------------------------------------------

var code    = '';
var stdin   = process.openStdin();
var result;
var console = [];

// Get code
stdin.on('data', function(data) {
  code += data;
});
stdin.on('end', run);

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
    };

    global.print = send.bind(global, 'stdout');
    global.console = { log: send.bind(global, 'stdout') };
    global.process = { 
      stdout: { write: send.bind(global, 'stdout') }
    };
    global.postMessage = send.bind(global, 'message');

    // This is where the user's source code is actually evaluated
    var result = UserScript(src)();
    send('end', result);
  }
};

// Run code
function run() {

  var context = vm.createContext();
  var safeRunner = vm.runInContext('('+getSafeRunner.toString()+')()', context);
  
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
          case 'message':
            process.send(JSON.parse(value)[0]);
            break;
          default:
            throw new Error('Unknown event type');
        }
      },
      exit: function(){
        processExit();
      }
    }, code);
  }
  catch (e) {
    result = e.name + ': ' + e.message;
    // throw e;
  }

  process.on('message', processMessageListener.bind(null, context));
  
  process.send('__sandbox_inner_ready__');

  // This will exit the process if onmessage was not defined
  checkIfProcessFinished(context);
};

function processMessageListener(context, message){
  vm.runInContext('if (typeof onmessage === "function") { onmessage('+ JSON.stringify(String(message)) + '); }', context);
  checkIfProcessFinished(context);
};

function checkIfProcessFinished(context) {
  if(vm.runInContext('typeof onmessage', context) !== 'function') {
    processExit();
  }
};

function processExit() {
  process.removeListener('message', processMessageListener);

  process.stdout.on('finish', function() {
    process.exit(0);
  });

  process.stdout.end(JSON.stringify({ result: util.inspect(result), console: console }));
};
