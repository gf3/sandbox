//-----------------------------------------------------------------------------
// Init
//-----------------------------------------------------------------------------

// Using chai/expect instead of should because it handles
// null and undefined values more cleanly
var chai      = require('chai');
var expect    = chai.expect;
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var Sandbox   = require('../lib/sandbox');

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
      expect(output.result).to.equal('2');
      done();
    });
  });

  it('should gracefully handle syntax errors', function(done) {
    sb.run('hi )there', function(output) {
      expect(output.result).to.equal("'SyntaxError: Unexpected token )'");
      done();
    });
  });

  it('should effectively prevent code from accessing node', function(done) {
    sb.run('process.platform', function(output) {
      expect(output.result).to.equal("null");
      done();
    });
  });

  it('should effectively prevent code from circumventing the sandbox', function(done) {
    sb.run("var sys=require('sys'); sys.puts('Up in your fridge')", function(output) {
      expect(output.result).to.equal("'ReferenceError: require is not defined'");
      done();
    });
  });

  it('should timeout on infinite loops', function(done) {
    sb.run('while ( true ) {}', function(output) {
      expect(output.result).to.equal('TimeoutError');
      done();
    });
  });

  it('should allow console output via `console.log`', function(done) {
    sb.run('console.log(7); 42', function(output) {
      expect(output.result).to.equal('42');
      expect(output.console).to.have.length(1);
      expect(output.console[0]).to.equal(7);
      done();
    });
  });

  it('should allow console output via `print`', function(done) {
    sb.run('print(7); 42', function(output) {
      expect(output.result).to.equal('42');
      expect(output.console).to.have.length(1);
      expect(output.console[0]).to.equal(7);
      done();
    });
  });

  it('should maintain the order of sync. console output', function(done) {
    sb.run('console.log("first"); console.log("second"); 42', function(output) {
      expect(output.result).to.equal('42');
      expect(output.console).to.have.length(2);
      expect(output.console[0]).to.equal('first');
      expect(output.console[1]).to.equal('second');
      done();
    });
  });

  it('should expose the postMessage command to the sandboxed code', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.run('postMessage("Hello World!");', function(output){
      expect(messageHandler.calledOnce).to.be.true;
      expect(messageHandler).to.be.calledWith('Hello World!');
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
      expect(messageHandler).to.be.calledOnce;
      expect(messageHandler).to.be.calledWith('Hello World!');
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
      expect(messageHandler.callCount).to.equal(num_messages_sent);
      expect(num_messages_sent).to.be.greaterThan(0);
      done();
    });
    sb.on('ready', function(){
      clearInterval(interval);
    });
  });

});