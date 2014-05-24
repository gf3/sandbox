//-----------------------------------------------------------------------------
// Init
//-----------------------------------------------------------------------------

var should  = require('should');
var Sandbox = require('../lib/sandbox');
var sb      = new Sandbox();


//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe('Sandbox', function() {

  it('should execute basic javascript', function() {
    sb.run('1 + 1', function(output) {
      output.result.should.eql('2');
    });
  });

  it('should gracefully handle syntax errors', function() {
    sb.run('hi )there', function(output) {
      output.result.should.eql("'SyntaxError: Unexpected token )'");
    });
  });

  it('should effectively prevent code from accessing node', function() {
    sb.run('process.platform', function(output) {
      output.result.should.eql("'ReferenceError: process is not defined'");
    });
  });

  it('should effectively prevent code from circumventing the sandbox', function() {
    sb.run("var sys=require('sys'); sys.puts('Up in your fridge')", function(output) {
      output.result.should.eql("'ReferenceError: require is not defined'");
    });
  });

  it('should timeout on infinite loops', function() {
    sb.run('while ( true ) {}', function(output) {
      output.result.should.eql('TimeoutError');
    });
  });

  it('should allow console output via `console.log`', function() {
    sb.run('console.log(7); 42', function(output) {
      output.result.should.eql('42');
      output.console[0].should.eql(7);
    });
  });

  it('should allow console output via `print`', function() {
    sb.run('print(7); 42', function(output) {
      output.result.should.eql('42');
      output.console[0].should.eql(7);
    });
  });

  it('should maintain the order of sync. console output', function() {
    sb.run('console.log("first"); console.log("second"); 42', function(output) {
      output.result.should.eql('42');
      output.console[0].should.eql('first');
      output.console[1].should.eql('second');
    });
  });

});
