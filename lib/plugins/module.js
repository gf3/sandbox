require('colors');

var options = {};

exports.init = function (done) {
  return done();
}

exports.name = 'commonjs';
// `exports.attach` gets called by broadway on `app.use`
exports.attach = function (_options) {
  options = _options || {}
  options.whitelist = options.whitelist || ['underscore', 'async']
  options.customModules = {};
  // `exports.init` gets called by broadway on `app.init`.
  exports.init = function (done) {
    var self = this;
    this.on('shovel::module::*', function(module) {
      options.customModules[this.event.slice(16)] = module;
    });
    
    if(this.IAmParent) {//I'm in the parent ("sandbox")

      
    } else if(this.IAmChild) {//I'm in the child ("shovel")
      this.sandbox.exports = {}
      this.sandbox.module = {}
      this.sandbox.require = function sandboxRequire(module) {
        if(options.customModules[module]) {
          return options.customModules[module];
        }
        if(!!~ options.whitelist.indexOf(module)) // only whitelisted modules
          return require(module)
        throw Error ("Invalid module <"+module+">, valid modules are : "+ options.whitelist.join())
      } 
    }
    // This plugin doesn't require any initialization step.
    return done()
  }
}

