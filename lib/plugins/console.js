require('colors')

exports.name = 'console';
// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (options) {
  
}

// `exports.init` gets called by broadway on `app.init`.
exports.init = function (done) {
    var app = this;
    
    if(app.IAmParent) {//I'm in the parent ("sandbox")
      app.on('sandbox::console', function(level, args) {
        args = args || [];
        args.unshift((app.options.name + '> ').bold);
        console[level].apply(console, args);
      })
      
    } else if(app.IAmChild) {//I'm in the child ("shovel")
      function log(level) {
        var logger = function () {
          
          var args = Array.prototype.slice.call(arguments); //make it a real array
          app.emit('sandbox::console', level, args)
        }
        logger.name = level
        return logger;
      }    
    
      app.sandbox.console = {
        log:   log('log'),
        debug: log('debug'),
        error: log('error')
      }
      
    }
    // This plugin doesn't require any initialization step.
    return done()
  }

