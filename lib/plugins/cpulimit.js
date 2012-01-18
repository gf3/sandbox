var posix = require('posix')
  ,  proc = require('getrusage')
  
require('colors')

exports.name = 'cpulimit';
// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (options) {
  var defaults = {soft: 2, hard: 2};
  options = options || defaults
  Object.keys(defaults).forEach(function(key){
    options[key] = options[key] || defaults[key];
  })

  if(! isFinite(options.soft) || ! isFinite(options.hard))
    throw Error("Both hard and soft CPU limits should be set, and they should be finite Numbers")
    
  // `exports.init` gets called by broadway on `app.init`.
  exports.init = function (done) {
    var self = this;

    if(this.IAmParent) {//I'm in the parent ("sandbox")

//      self.child.on('exit', function() {console.log(self.name.cyan, 'child exit', arguments)})
    } else if(this.IAmChild) {//I'm in the child ("shovel")
      var start = proc.getcputime()
//      console.log('current cpu usage :'.bold.yellow, start);
      
      function onKill() {
        console.log('final cpu usage :'.bold.red, proc.getcputime())
        var err = Error("ECANCELED - You code is eating too much CPU !")
        err.refinedStack = err.message
        err.code = require('constants').ETIMEDOUT
        
        self.emit("sandbox::result", err)
        throw err;
/*        setTimeout(function() {
          process.exit(1);
        },20)*/
      }
      
      this.on('sandbox::return')
      process.on('SIGXCPU', onKill)
      process.on('SIGKILL', onKill)
      process.on('SIGSTOP', onKill)
      process.on('SIGILL', onKill)
      process.on('SIGFPE', onKill)
      process.on('SIGSEGV', onKill)

      posix.setrlimit('cpu', options)
      //FIXME error reporting ?
    }
    // This plugin doesn't require any initialization step.
    return done()
  }
}

