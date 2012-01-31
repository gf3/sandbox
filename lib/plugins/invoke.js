require('colors')

exports.name = 'invoke';
exports.attach = function (options) {
  options.invoke = options.invoke || "main";
  options.args = options.args || [];
  exports.init = function (done) {
    var app = this;
    app.on("shovel::runner::run", function() {
      app.sandbox.__invokeArgs =  options.args
      app.runner.source += '\n' + options.invoke + '.apply(this, __invokeArgs)'
    });
    done();
  }
}

