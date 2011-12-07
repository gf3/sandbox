var console = []

export.name = console;
// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (options) {
console.log("attach console")
  if(this.child) {//I'm in the parent ("sandbox")
  
    this.child.on('child::console', function(level, args) {
      args.unshift('Sandbox> ');
      console[level].apply(args);
    })
    
  } else if(process.parent) {//I'm in the child ("shovel")
  
    function log(level) {
        return process.parent.emit('child::console')
    }    
  }
};

// `exports.init` gets called by broadway on `app.init`.
exports.init = function (done) {
console.log("init console")

  // This plugin doesn't require any initialization step.
  return done();

};
