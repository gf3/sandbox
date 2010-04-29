var sys = require("sys")
  , Sandbox = require("../lib/sandbox")
  , s = new Sandbox()
  ;

// Example 1 - Standard JS
s.run("1 + 1", function(output) {
  sys.puts("Example 1: " + output + "\n");
});

// Example 2 - Something slightly more complex
s.run("(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", function(output) {
  sys.puts("Example 2: " + output + "\n");
});

// Example 3 - Syntax error
s.run("lol)hai", function(output) {
  sys.puts("Example 3: " + output + "\n");
});

// Example 4 - Restricted code
s.run("process.platform", function(output) {
  sys.puts("Example 4: " + output + "\n");
});

// Example 5 - Infinite loop
s.run("while (true) {}", function(output) {
  sys.puts("Example 5: " + output + "\n");
});
