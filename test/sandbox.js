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
    sb.run('1 + 1', function(error, result) {
      expect(error).not.to.exist;
      expect(result).to.equal('2');
      done();
    });
  });

  it('should call the callback with (null, null) if there is no error or result', function(done){
    sb.run('', function(error, result){
      expect(error).not.to.exist;
      expect(result).not.to.exist;
      done();
    });
  });

  it('should gracefully handle syntax errors', function(done) {
    sb.run('hi )there', function(error, result) {
      expect(error).to.equal('SyntaxError: Unexpected token )');
      expect(result).not.to.exist;
      done();
    });
  });

  it('should effectively prevent code from accessing node', function(done) {
    sb.run('process.platform', function(error, result) {
      expect(error).not.to.exist;
      expect(result).not.to.exist;
      done();
    });
  });

  it('should effectively prevent code from circumventing the sandbox', function(done) {
    sb.run("var sys=require('sys'); sys.puts('Up in your fridge')", function(error, result) {
      expect(error).to.equal('ReferenceError: require is not defined');
      expect(result).not.to.exist;
      done();
    });
  });

  it('should timeout on infinite loops', function(done) {
    sb.run('while ( true ) {}', function(error, result) {
      expect(error).to.equal('TimeoutError');
      expect(result).not.to.exist;
      done();
    });
  });

  it('should allow console output via `console.log`', function(done) {
    var stdout_spy = sinon.spy();
    var normal_stdout = sb._stdout;
    sb._stdout = { write: stdout_spy };
    sb.run('console.log(7); 42', function(error, result) {
      expect(error).not.to.exist;
      expect(result).to.equal('42');
      expect(stdout_spy).to.be.calledOnce;
      expect(stdout_spy).to.be.calledWith('7\n');

      sb._stdout = normal_stdout;
      done();
    });
  });

  it('should allow console output via `print`', function(done) {
    var stdout_spy = sinon.spy();
    var normal_stdout = sb._stdout;
    sb._stdout = { write: stdout_spy };
    sb.run('print(7); 42', function(error, result) {
      expect(error).not.to.exist;
      expect(result).to.equal('42');
      expect(stdout_spy).to.be.calledOnce;
      expect(stdout_spy).to.be.calledWith('7\n');

      sb._stdout = normal_stdout;
      done();
    });
  });

  it('should maintain the order of sync. console output', function(done) {
    var stdout_spy = sinon.spy();
    var normal_stdout = sb._stdout;
    sb._stdout = { write: stdout_spy };
    sb.run('console.log("first"); console.log("second"); 42', function(error, result) {
      expect(error).not.to.exist;
      expect(result).to.equal('42');
      expect(stdout_spy).to.be.calledTwice;
      expect(stdout_spy.firstCall).to.be.calledWith('first\n');
      expect(stdout_spy.secondCall).to.be.calledWith('second\n');

      sb._stdout = normal_stdout;
      done();
    });
  });

  it('should expose the postMessage command to the sandboxed code', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.run('postMessage("Hello World!");', function(error, result){
      expect(error).not.to.exist;
      expect(messageHandler.calledOnce).to.be.true;
      expect(messageHandler).to.be.calledWith('Hello World!');

      sb.removeListener('message', messageHandler);
      done();
    });
  });

  it('should allow sandboxed code to receive messages sent by postMessage from the outside by overwriting the onmessage function', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.on('ready', function () {
      sb.postMessage('Hello World!');
    });
    sb.run('onmessage = function (msg) { postMessage(msg); };', function(error, result) {
      // expect(error).not.to.exist;
      expect(messageHandler).to.be.calledOnce;
      expect(messageHandler).to.be.calledWith('Hello World!');

      sb.removeListener('message', messageHandler);
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
    sb.run('onmessage = function (msg) { postMessage(msg); };', function(error, result) {
      // expect(error).not.to.exist;
      expect(messageHandler.callCount).to.equal(num_messages_sent);
      expect(num_messages_sent).to.be.greaterThan(0);

      sb.removeListener('message', messageHandler);
      done();
    });
    sb.on('ready', function(){
      clearInterval(interval);
    });
  });

  it('should expose the `process.exit` function to the sandboxed code', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.run('onmessage = function (msg) { postMessage(msg); }; process.exit();', function(error, result) {
      expect(error).not.to.exist;
      expect(messageHandler).not.to.be.called;

      sb.removeListener('message', messageHandler);
      done();
    });
    sb.on('ready', function(){
      sb.postMessage('this shouldnt get sent');
    });
  });

  it('should call the callback if `onmessage` is set to null after it receives one message', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.run('var msgfunction = function(msg) { postMessage(msg); onmessage = null; }; onmessage = msgfunction;', function(error, result){
      expect(error).not.to.exist;
      expect(messageHandler).to.be.called;

      sb.removeListener('message', messageHandler);
      done();
    });
    sb.postMessage('Hello World!');
  });

  it('should only base the `result` on the synchronous part of the code, not on the async `onmessage` function', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.run('var msgfunction = function(msg) { postMessage(msg); onmessage = null; return 42; }; onmessage = msgfunction;', function(error, result){
      expect(error).not.to.exist;
      expect(messageHandler).to.be.called;
      expect(result).not.to.exist;

      sb.removeListener('message', messageHandler);
      done();
    });
    sb.postMessage('Hello World!');
  });

  it('should result in a TimeoutError if `onmessage` is used but `process.exit` is never called and `onmessage` is not set to null', function(done){
    var messageHandler = sinon.spy();
    sb.on('message', messageHandler);
    sb.run('var msgfunction = function(msg) { postMessage(msg); 42 }; onmessage = msgfunction;', function(error, result){
      expect(error).to.equal('TimeoutError');
      expect(messageHandler).to.be.called;
      expect(result).not.to.exist;

      sb.removeListener('message', messageHandler);
      done();
    });
    sb.postMessage('Hello World!');
  });

});
