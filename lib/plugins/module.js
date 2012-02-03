require('colors');

exports.name = 'commonjs';
var options = {};

exports.attach = function (_options) {
  options = _options || {}
  options.whitelist = options.whitelist || ['underscore', 'async']
  options.customModules = {};
  // `exports.init` gets called by broadway on `app.init`.
  exports.init = function (done) {
    var self = this;

    if(this.IAmParent) {//I'm in the parent ("sandbox")
      
    } else if(this.IAmChild) {//I'm in the child ("shovel")
      var name;
      this.on('shovel::module::*', function(module) {
        name = this.event.slice('shovel::module::'.length)
        options.customModules[name] = module;
        console.log('Added custom module <', name.bold, '> to sandbox require')
      });
      
      this.sandbox.exports = {}
      this.sandbox.module = {exports: this.sandbox.exports }
      this.sandbox.require = function sandboxRequire(module) {
      
        if(options.customModules[module])
          return options.customModules[module]

        if(!!~ options.whitelist.indexOf(module)) // only whitelisted modules
          return require(module)
          
        throw Error ("Invalid module <"+module+">, valid modules are : "+ options.whitelist.join())
      }
    }
    // This plugin doesn't require any initialization step.
    return done()
  }
}

