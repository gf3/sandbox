// shovel.js - Do the heavy lifting in this sandbox
// Gianni Chiappetta - gf3.ca - 2010

/* ------------------------------ INIT ------------------------------ */
var code = "",
    reserved = {
      // Node
      "require": null,
      "__filename": null,
      "__module": null,
      "module": null,
      "this": {},
      // Local
      "code": null,
      "reserved": null,
      "run": null
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
      return eval('with (reserved) { ' + code + ' }');
    }
    catch (e) {
      return e.name + ': ' + e.message;
    }
  }).call({});
  
  process.stdio.write(output);
  process.exit(0);
}