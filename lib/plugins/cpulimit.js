var posix = require('posix')
  ,  proc = require('getrusage')
  
require('colors')

var defaults = {soft: 10, hard: 11};

exports.name = 'cpulimit';
// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (options) {

  options = options || defaults
  Object.keys(defaults).forEach(function(key){
    options[key] = options[key] || defaults[key];
  })

  if(! isFinite(options.soft) || ! isFinite(options.hard))
    throw Error("Both hard and soft CPU limits should be set, and they should be finite Numbers")
    
  // `exports.init` gets called by broadway on `app.init`.
  exports.init = function (done) {
    var app = this;

    if(this.IAmParent) {//I'm in the parent ("sandbox")
      
//      app.on('exit', function() {console.log(self.name.cyan, 'child exit', arguments)})
    } else if(this.IAmChild) {//I'm in the child ("shovel")
    
      var start = proc.getcputime()
      
//      console.log('cpu time at start:'.bold, start)
      
//      console.log('original cpu limit:'.bold, posix.getrlimit('cpu'))
      posix.setrlimit('cpu', options)
      
//      console.log('new cpu limit:'.bold, posix.getrlimit('cpu'))
//      console.log('current cpu time :'.bold.yellow, start);
      
      /*setInterval(function(){
        console.log('cpu time :'.bold.yellow, proc.getcputime())
      }, 100)*/
      
      function onKill() {
        console.log('final cpu usage :'.bold.red, proc.getcputime())
        var err = Error("ECANCELED - Your code is eating too much CPU !")
        err.refinedStack = err.message
        err.code = require('constants').ETIMEDOUT
        
        app.emit("sandbox::limit::cpu", proc.getcputime(), posix.getrlimit('cpu') )
        app.emit("shovel::exit")
        app.emit("sandbox::return", err)
        
        //throw err;
        process.nextTick(process.nextTick.bind(function() {
          process.exit(1);
        }))
      }
      
//      this.on('sandbox::return')
      process.on('SIGXCPU', onKill)
/*      process.on('SIGKILL', onKill)
      process.on('SIGSTOP', onKill)
      process.on('SIGILL', onKill)
      process.on('SIGFPE', onKill)
      process.on('SIGSEGV', onKill)
      process.on('SIGTERM', onKill)*/

      //FIXME error reporting ?
    }
    // This plugin doesn't require any initialization step.
    return done()
  }
}

