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

  it('should execute basic javascript', function(done) {
    sb.run('1 + 1', function(output) {
      output.result.should.eql('2');
      done();
    });
  });

  it('should gracefully handle syntax errors', function(done) {
    sb.run('hi )there', function(output) {
      output.result.should.eql("'SyntaxError: Unexpected token )'");
      done();
    });
  });

  it('should effectively prevent code from accessing node', function(done) {
    sb.run('process.platform', function(output) {
      output.result.should.eql("null");
      done();
    });
  });

  it('should effectively prevent code from circumventing the sandbox', function(done) {
    sb.run("var sys=require('sys'); sys.puts('Up in your fridge')", function(output) {
      output.result.should.eql("'ReferenceError: require is not defined'");
      done();
    });
  });

  it('should timeout on infinite loops', function(done) {
    sb.run('while ( true ) {}', function(output) {
      output.result.should.eql('TimeoutError');
      done();
    });
  });

  it('should allow console output via `console.log`', function(done) {
    sb.run('console.log(7); 42', function(output) {
      output.result.should.eql('42');
      output.console[0].should.eql(7);
      done();
    });
  });

  it('should allow console output via `print`', function(done) {
    sb.run('print(7); 42', function(output) {
      output.result.should.eql('42');
      output.console[0].should.eql(7);
      done();
    });
  });

  it('should maintain the order of sync. console output', function(done) {
    sb.run('console.log("first"); console.log("second"); 42', function(output) {
      output.result.should.eql('42');
      output.console[0].should.eql('first');
      output.console[1].should.eql('second');
      done();
    });
  });

});
