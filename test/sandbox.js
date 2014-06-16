//-----------------------------------------------------------------------------
// Init
//-----------------------------------------------------------------------------

var should  = require('should');
var sinon   = require('sinon');
var Sandbox = require('../lib/sandbox');

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe('Sandbox', function() {
  var sb;
  beforeEach(function(){
    sb = new Sandbox();
  });

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

  it('should expose the postMessage command to the sandboxed code', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.run('postMessage("Hello World!");', function(output){
      messageHandler.calledOnce.should.eql(true);
      messageHandler.calledWith('Hello World!').should.eql(true);
      done();
    });
  });

  it('should allow sandboxed code to receive messages sent by postMessage from the outside by overwriting the onmessage function', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.on('ready', function () {
      sb.postMessage('Hello World!');
    });
    sb.run('onmessage = function (msg) { postMessage(msg); };', function(output) {
      messageHandler.callCount.should.eql(1);
      messageHandler.calledWith('Hello World!').should.eql(true);
      done();
    });
  });
  
  it('should queue messages posted before the sandbox is ready and process them once it is', function(done){
    var messageHandler = sinon.spy();
    var num_messages_sent = 0;
    var interval = setInterval(function(){
      sb.postMessage(++num_messages_sent);
    }, 1);
    sb.on('message', messageHandler);
    sb.run('onmessage = function (msg) { postMessage(msg); };', function(output) {
      messageHandler.callCount.should.eql(num_messages_sent);
      num_messages_sent.should.be.greaterThan(0);
      done();
    });
    sb.on('ready', function(){
      clearInterval(interval);
    });
  });

});