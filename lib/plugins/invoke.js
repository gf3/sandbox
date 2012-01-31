require('colors')

exports.name = 'invoke';

exports.attach = function (options) {
  options.invoke = options.invoke || "main";
  options.args = options.args || [];
  
  exports.init = function (done) {
    var app = this;
    app.on("shovel::runner::run", function() {
      app.sandbox.__invokeArgs =  options.args
      app.runner.source += '\n typeof '+ options.invoke +' === "function" ?' + options.invoke + '.apply(this, __invokeArgs):Error("Your code is invalid, it doesn\'t contain a function \''+options.invoke+'\'")'
    });
    done();
  }
}

