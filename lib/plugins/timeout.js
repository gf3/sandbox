// `exports.attach` gets called by broadway on `app.use`
require('colors');
exports.name = 'timeout'
exports.attach = function (options) {
  options = options || {}
  options.timeout = options.timeout || 5000
//  console.log('timeout :', options.timeout, 'ms')
  // `exports.init` gets called by broadway on `app.init`.
  // this is 
  exports.init = function (done) {
    var app = this;
    
    if(this.IAmParent) {//I'm in the parent ("sandbox")
      var returned = false;
      
      app.on("sandbox::shovel::run", function(){
        var start = Date.now()
        
        var to = setTimeout(function onTimeout() {
          if(returned)
            return;
//          console.log('---------STTTOOOOOOOOOOPPPPP----------'.bold.red)
          var err = Error("ETIMEDOUT - Your code is taking too much time : more than " + options.timeout + " ms")
          err.refinedStack = err.message ;
          err.code = require('constants').ETIMEDOUT

          app.emit("sandbox::timeout", options.timeout )          
          app.emit("shovel::exit")
          app.emit("sandbox::return", err)
          
          process.nextTick(function() {
            app.emit("shovel::kill", 'SIGKILL')
          })

//          process.nextTick(function(){app.child.emit('exit')})
        }, options.timeout)
        
        app.on("sandbox::shovel::stopped", function() {
          returned = true;
          var time = Date.now() - start;
//          app.emit("shovel::runner::time", time)
          clearTimeout(to)
          app.emit("sandbox::executiontime", time)
          console.log((app.name +' execution took').bold.cyan, time, 'ms')
        })
        app.on("sandbox::return", function(){
          clearTimeout(to)
        })
        
      });
    } else if(this.IAmChild) {//I'm in the child ("shovel")
      //nothing to be done
      /*app.on("shovel::runner::run", function(runner){
        runner.return.setTimeout(options.timeout)
      })*/
//      function logStatus (){console.log("shovel runner->".bold, app.runner)}
//      logStatus();
//      setInterval(logStatus, 50)
    }
    // This plugin doesn't require any initialization step.
    return done();
  }
};

