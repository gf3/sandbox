var console = []

// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (options) {

  options.sandbox.console = { log: function() {
      var i, l
      for ( i = 0, l = arguments.length; i < l; i++ )
        console.push( util.inspect( arguments[i] ) )
    }
  }
};

// `exports.init` gets called by broadway on `app.init`.
exports.init = function (done) {

  // This plugin doesn't require any initialization step.
  return done();

};
