// sandbox.js - Rudimentary JS sandbox
// Gianni Chiappetta - gf3.ca - 2010

/*------------------------- INIT -------------------------*/
var sys = require("sys");

/*------------------------- Sandbox -------------------------*/
function Sandbox(options) {
  this.options = process.mixin(process.mixin({}, Sandbox.options), options || {});
  
  this.run = function(code, hollaback) {
    // Any vars in da house?
    var timer,
        stdout = "",
        output = function(data) {
          if (!!data) stdout += data;
        },
        child = process.createChildProcess(this.options.node, [this.options.shovel]);
    
    // Listen
    child.addListener("output", output);
    child.addListener("exit", function(code) {
      clearTimeout(timer);
      hollaback.call(this, stdout);
    });
    
    // Go
    child.write(code);
    child.close();
    timer = setTimeout(function() {
      child.removeListener("output", output);
      stdout = "TimeoutError";
      child.kill();
    }, this.options.timeout);
  };
}

// Options
Sandbox.options = {
  timeout: 500,
  node: "node",
  shovel: (function() {
    var p = __filename.split("/").slice(0, -1);
    p.push("shovel.js");
    return p.join("/");
  })()
};

/*------------------------- Export -------------------------*/
exports.Sandbox = Sandbox;

