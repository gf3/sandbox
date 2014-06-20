//-----------------------------------------------------------------------------
// Init
//-----------------------------------------------------------------------------

var fs           = require('fs');
var path         = require('path');
var spawn        = require('child_process').spawn;
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var concat       = require('concat-stream');

//-----------------------------------------------------------------------------
// Constructor
//-----------------------------------------------------------------------------

function Sandbox(options) {
  var self = this;

  // message_queue is used to store messages that are meant to be sent
  // to the sandbox before the sandbox is ready to process them
  self._ready = false;
  self._message_queue = [];

  // Instance keeps a reference to stdout so it can be
  // overwritten for testing purposes
  self._stdout = process.stdout;

  self.options = {
    timeout: 500,
    node:    'node',
    shovel:  path.join(__dirname, 'shovel.js')
  };

  self.info = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));
}

// Make the Sandbox class an event emitter to handle messages
util.inherits(Sandbox, EventEmitter);


//-----------------------------------------------------------------------------
// Instance Methods
//-----------------------------------------------------------------------------

Sandbox.prototype.run = function(code, callback) {
  var self = this;
  var timer;
  var result;
  var error = null;

  // Spawn child process
  self.child = spawn(this.options.node, [this.options.shovel], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });

  // Pass data written to stdout directly to this process' stdout
  function stdoutHandler(data){
    var lines = String(data).split('\n');
    lines.forEach(function(line, index){
      // String.split will result in an extra empty string at the end
      if (index !== lines.length - 1 || line) {
        self._stdout.write(line + '\n');
      }
    });
  };
  self.child.stdout.on('data', stdoutHandler);

  // Listen for errors and call the callback immediately
  function stderrHandler(data) {
    if (data && data.length > 0) {
      error = String(data);
    }
  };
  self.child.stderr.pipe(concat(stderrHandler));

  // Pass messages out from child process
  // These messages can be handled by Sandbox.on('message', function(message){...});
  self.child.on('message', function(message){
    if (typeof message !== 'object' || typeof message.type !== 'string') {
      throw new Error('Bad IPC Message: ' + JSON.stringify(message));
    }

    if (message.type === 'ready') {

      self._ready = true;
      self.emit('ready');

      // Process the _message_queue
      while(self._message_queue.length > 0) {
        self.postMessage(self._message_queue.shift());
      }

    } else if (message.type === 'result') {

      // Should this be stringified?
      result = String(message.data);

      // Special case null and undefined so that the result does not
      // end up as a stringified version (i.e. "null")
      if (result === 'null') {
        result = null;
      } else if (result === 'undefined') {
        result = undefined;
      }


    } else if (message.type === 'message') {

      self.emit('message', message.data);

    } else {
      throw new Error('Bad IPC Message: ' + JSON.stringify(message));
    }
  });

  // This function should be the only one that calls the hollback
  function onExit(code) {
    clearTimeout(timer);
    setImmediate(function(){
      if (typeof callback === 'function') {
        callback(error, result);
      }
    });
  };
  self.child.on('exit', onExit);


  // Go
  self.child.stdin.write(code);
  self.child.stdin.end();

  timer = setTimeout(function() {
    self.child.stdout.removeListener('data', stdoutHandler);
    error = 'TimeoutError';
    self.child.kill('SIGKILL');
  }, self.options.timeout);
};

// Send a message to the code running inside the sandbox
// This message will be passed to the sandboxed
// code's `onmessage` function, if defined.
// Messages posted before the sandbox is ready will be queued
Sandbox.prototype.postMessage = function(message) {
  var self = this;

  if (self._ready) {
    self.child.send(message);
  } else {
    self._message_queue.push(message);
  }
};

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = Sandbox;
