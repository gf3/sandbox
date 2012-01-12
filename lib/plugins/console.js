require('colors')

exports.name = 'console';
// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (options) {
  // `exports.init` gets called by broadway on `app.init`.
  exports.init = function (done) {
    var self= this;
    
    if(this.IAmParent) {//I'm in the parent ("sandbox")
      this.child.on('child::console', function(level, args) {
        args = args || [];
        args.unshift((self.options.name + '> ').bold);
        console[level].apply(console, args);
      })
      
    } else if(this.IAmChild) {//I'm in the child ("shovel")
      function log(level) {
        return function() {
          var args = Array.prototype.slice.call(arguments); //make it a real array
          process.parent.emit('child::console', level, args)
        }
      }    
    
      this.sandbox.console = {
        log:   log('log'),
        debug: log('debug'),
        error: log('error')
      }
      
    }
    // This plugin doesn't require any initialization step.
    return done()
  }
}

