// `exports.attach` gets called by broadway on `app.use`
require('colors');
exports.name = 'timeout'
exports.attach = function (options) {
  options = options || {}
  options.timeout = options.timeout || 250
//  console.log('timeout :', options.timeout, 'ms')
  // `exports.init` gets called by broadway on `app.init`.
  // this is 
  exports.init = function (done) {
    var app = this;
    
    if(this.IAmParent) {//I'm in the parent ("sandbox")
      var returned = false;
      
      app.on("sandbox::run", function(){
        var start = Date.now()
        
        setTimeout(function onTimeout() {
          if(returned)
            return;
//          console.log('---------STTTOOOOOOOOOOPPPPP----------'.bold.red)
          var err = Error("ETIMEDOUT - Your code is taking too much time")
          err.refinedStack = err.message ;
          err.code = require('constants').ETIMEDOUT
          
          app.emit("shovel::kill")
          app.child.localEmit("sandbox::return", err)
          
          setTimeout(function() {
            app.emit("shovel::kill", 'SIGKILL')
          }, 50)

//          process.nextTick(function(){app.child.emit('exit')})
        }, options.timeout)
        
        app.on("shovel::runner::stopped", function() {
          returned = true;
          var time = Date.now() - start;
//          app.emit("shovel::runner::time", time)
          app.emit("shovel::runner::timeout", time)
          console.log((app.name +' execution took').bold.cyan, time, 'ms')
        })
        
      });
    } else if(this.IAmChild) {//I'm in the child ("shovel")
      //nothing to be done
      app.on("shovel::runner::run", function(runner){
        runner.return.setTimeout(options.timeout)
      })
//      function logStatus (){console.log("shovel runner->".bold, app.runner)}
//      logStatus();
//      setInterval(logStatus, 50)
    }
    // This plugin doesn't require any initialization step.
    return done();
  }
};

