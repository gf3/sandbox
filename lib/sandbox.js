//-----------------------------------------------------------------------------
// Init
//-----------------------------------------------------------------------------

var fs    = require('fs');
var path  = require('path');
var spawn = require('child_process').spawn;


//-----------------------------------------------------------------------------
// Constructor
//-----------------------------------------------------------------------------

function Sandbox(options) {
  (this.options = options || {}).__proto__ = Sandbox.options;
}


//-----------------------------------------------------------------------------
// Instance Methods
//-----------------------------------------------------------------------------

Sandbox.prototype.run = function(code, hollaback) {
  var timer;
  var stdout = '';
  var child  = spawn(this.options.node, [this.options.shovel]);
  var output = function(data) {
    if (!!data)
      stdout += data;
  };

  if (typeof hollaback == 'undefined')
    hollaback = console.log;
  else
    hollaback = hollaback.bind(this);

  // Listen
  child.stdout.on('data', output);
  child.on('exit', function(code) {
    clearTimeout(timer);
    setImmediate(function(){
      if (!code && !stdout)
        hollaback({ result: 'Error', console: [] });
      else
        hollaback(JSON.parse(stdout));
    });
  });

  // Go
  child.stdin.write(code);
  child.stdin.end();
  timer = setTimeout(function() {
    child.stdout.removeListener('output', output);
    stdout = JSON.stringify({ result: 'TimeoutError', console: [] });
    child.kill('SIGKILL');
  }, this.options.timeout);
};


//-----------------------------------------------------------------------------
// Class Properties
//-----------------------------------------------------------------------------

Sandbox.options = {
  timeout: 500,
  node:    'node',
  shovel:  path.join(__dirname, 'shovel.js')
};

fs.readFile(path.join(__dirname, '..', 'package.json'), function(err, data) {
  if (err)
    throw err;
  else
    Sandbox.info = JSON.parse(data);
});


//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------

module.exports = Sandbox;
