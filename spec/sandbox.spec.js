/* ------------------------------ INIT ------------------------------ */

var Sandbox = require('../lib/sandbox')

/* ------------------------------ Tests ------------------------------ */
var sb = new Sandbox();
exports['it should execute basic javascript'] = function(test) {
  sb.run('1 + 1', function(output) {
	test.equal(output,2)
	test.finish();
  });
};

exports['it should gracefully handle syntax errors'] = function(test) {
  sb.run('hi)there', function(output) {
	test.equal(output,"'SyntaxError: Unexpected token )'")
	test.finish();
  });
};

exports['it should effectively prevent code from accessing node'] = function(test) {
  sb.run('process.platform', function(output) {
	test.equal(output,"'TypeError: Cannot read property \\'platform\\' of null'")
	test.finish();
  });
};

exports['it should effectively prevent code from circumventing the sandbox'] = function(test) {
  sb.run("1 + 1; sys= require('sys'); sys.puts('Up in your fridge'); function foo() {", function(output) {
	test.equal(output,"'SyntaxError: Unexpected end of input'")
	test.finish();
  });
};

exports['it should timeout on infinite loops'] = function(test) {
  sb.run('while (true) {}', function(output) {
	test.equal(output,"TimeoutError")
	test.finish();
  });
};

if (module == require.main) {
  require('async_testing').run(__filename, process.ARGV);
}

