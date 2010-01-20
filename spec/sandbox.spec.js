/* ------------------------------ INIT ------------------------------ */
var mjsunit = require('mjsunit');
process.mixin(GLOBAL, require('../vendor/simplicityjs/lib/simplicity'));
process.mixin(GLOBAL, require('../lib/sandbox'));

/* ------------------------------ Tests ------------------------------ */
var sb = new Sandbox();

expect('it should execute basic javascript', function(ok) {
  sb.run('1 + 1', function(output) {
    if (output === '2') ok();
  });
});

expect('it should gracefully handle syntax errors', function(ok) {
  sb.run('hi)there', function(output) {
    if (output === 'SyntaxError: Unexpected token )') ok();
  });
});

expect('it should effectively prevent code from accessing node', function(ok) {
  sb.run('process.platform', function(output) {
    if (output === "TypeError: Cannot read property 'platform' of null") ok();
  });
});

expect('it should effectively prevent code from circumventing the sandbox', function(ok) {
  sb.run("1 + 1; } sys= require('sys'); sys.puts('Up in your fridge'); function foo() {", function(output) {
    if (output === "SyntaxError: Unexpected token }") ok();
  });
});

expect('it should timeout on infinite loops', function(ok) {
  sb.run('while (true) {}', function(output) {
    if (output === "TimeoutError") ok();
  });
});
