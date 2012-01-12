// `exports.attach` gets called by broadway on `app.use`
require('colors');
exports.name = 'timeout'
exports.attach = function (options) {
  options = options || {}
  options.timeout = options.timeout || 50
  
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
          console.log('---------STTTOOOOOOOOOOPPPPP----------'.bold.red)
          self.child.emit('exit')
          var err = Error("ETIMEOUT - Execution is taking too much time")
          err.refinedStack= err.message + '\n' +'<your code>'
          self.emit("sandbox::return", err)
        }, options.timeout)
        
        self.child.on("sandbox::return", function() {
          returned = true;
          console.log((self.name +' execution took').bold.blue, Date.now() - start, 'ms')
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

