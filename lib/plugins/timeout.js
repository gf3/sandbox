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
    var self = this;
    
    if(this.IAmParent) {//I'm in the parent ("sandbox")
      var returned = false;
      
      self.child.on("sandbox::run", function(){
        var start = Date.now()
        
        setTimeout(function onTimeout() {
          if(returned)
            return;
//          console.log('---------STTTOOOOOOOOOOPPPPP----------'.bold.red)
          var err = Error("ETIMEDOUT - Your code is taking too much time")
          err.refinedStack = err.message ;
          err.code = require('constants').ETIMEDOUT
          
          self.emit("shovel::kill")
          self.child.localEmit("sandbox::return", err)
          setTimeout(function() {
            self.emit("sandbox::kill", 'SIGKILL')
          },50)

//          process.nextTick(function(){self.child.emit('exit')})
        }, options.timeout)
        
        self.child.on("sandbox::return", function() {
          returned = true;
          var time = Date.now() - start;
          self.emit("sandbox::time", time)
          self.child.emit("sandbox::timeout", time)
          console.log((self.name +' execution took').bold.cyan, time, 'ms')
        })
        
      });
    } else if(this.IAmChild) {//I'm in the child ("shovel")
      //nothing to be done
      self.on("runner::run", function(runner){
        runner.return.setTimeout(options.timeout)
      })
      
    }
    // This plugin doesn't require any initialization step.
    return done();
  }
};

