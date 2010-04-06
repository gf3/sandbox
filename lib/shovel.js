// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var sys = require("sys"),
    code = "",
    reserved = {
      // Node
      "require": null,
      "__filename": null,
      "__module": null,
      "module": null,
      // Local
      "code": null,
      "reserved": null,
      "run": null,
      "sys": null
    };

/* ------------------------------ Sandbox ------------------------------ */
// Generate list of reserved items
for (var i in GLOBAL) reserved[i] = null;

// Get code
process.stdio.addListener("data", function(data) {
  code += data;
});
process.stdio.addListener("close", run);
process.stdio.open();

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
  
  process.stdio.write(sys.inspect(output));
  process.exit(0);
}

