// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (options) {
  options = options || {}
  options.timeout = options.timeout || 500
  
  if(this.child) {//I'm in the parent ("sandbox")
    
    var timer = setTimeout( function() {
      this.child.localEmit("sandbox::error",
        Error("ETIMEOUT - Sandbox has not finished within its " + options.timeout + "ms"))
        
      this.child.kill( 'SIGKILL' )
    }, options.timeout )
      
    this.child.on( 'exit', function( code ) {
      clearTimeout( timer )
    })

    
  } else if(process.parent) {//I'm in the child ("shovel")
    //nothing to be done
  }
};

// `exports.init` gets called by broadway on `app.init`.
exports.init = function (done) {

  // This plugin doesn't require any initialization step.
  return done();

};
