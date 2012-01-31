require('colors')

exports.name = 'stdout';

exports.attach = function (options) {

  exports.init = function (done) {
    var app = this;
    if(app.IamChild)
      return done();
    app.on("shovel::ready", function (){
      app.child.on('stdout', function(txt) {
        app.emit("sandbox::shovel::stdout", txt)
        var text = String(txt).split('\n').map(function(txt){return (app.options.name + ' stdout> ').bold.blue, ""+txt}).join('\n')
        console.log(text)
      })

      app.child.on('stderr', function(txt) {
        app.emit("sandbox::shovel::stderr", txt)
        var text = String(txt).split('\n').map(function(txt){return (app.options.name + ' stderr> ').bold.yellow, ""+txt}).join('\n')
        //console.log((self.options.name + ' stderr> ').bold.yellow, ""+txt)
        console.log(text)
      })
    })
    done()
  }
}

