//-----------------------------------------------------------------------------
// Init
//-----------------------------------------------------------------------------

var fs           = require('fs');
var path         = require('path');
var spawn        = require('child_process').spawn;
var util         = require('util');
var EventEmitter = require('events').EventEmitter;

//-----------------------------------------------------------------------------
// Constructor
//-----------------------------------------------------------------------------

function Sandbox(options) {
  var self = this;
  
  // message_queue is used to store messages that are meant to be sent
  // to the sandbox before the sandbox is ready to process them
  self._ready = false;
  self._message_queue = [];
  
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

Sandbox.prototype.run = function(code, hollaback) {
  var self = this;
  var timer;
  var stdout = '';
  self.child = spawn(this.options.node, [this.options.shovel], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
  var output = function(data) {
    if (!!data) {
      stdout += data;
    }
  };

  if (typeof hollaback == 'undefined') {
    hollaback = console.log;
  } else {
    hollaback = hollaback.bind(this);
  }

  // Listen
  self.child.stdout.on('data', output);

  // Pass messages out from child process
  // These messages can be handled by Sandbox.on('message', function(message){...});
  self.child.on('message', function(message){
    if (message === '__sandbox_inner_ready__') {
      
      self.emit('ready');
      self._ready = true;
      
      // Process the _message_queue
      while(self._message_queue.length > 0) {
        self.postMessage(self._message_queue.shift());
      }

    } else {
      self.emit('message', message);
    }
  });
  
  self.child.on('exit', function(code) {
    clearTimeout(timer);
    setImmediate(function(){
      if (!stdout) {
        hollaback({ result: 'Error', console: [] });
      } else {
        var ret;
        try {
          ret = JSON.parse(stdout);
        } catch (e) {
          ret = { result: 'JSON Error (data was "'+stdout+'")', console: [] }
        }
        hollaback(ret);
      }
    });
  });

  // Go
  self.child.stdin.write(code);
  self.child.stdin.end();
  
  self.child.timer = setTimeout(function() {
    this.parent.stdout.removeListener('output', output);
    stdout = JSON.stringify({ result: 'TimeoutError', console: [] });
    this.parent.kill('SIGKILL');
  }, self.options.timeout);
  self.child.timer.parent = self.child;

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
