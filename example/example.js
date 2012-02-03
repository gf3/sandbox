var Sandbox = require("../lib/sandbox")
  , s;


// Example 1 - Standard JS
Sandbox("Simple addition").run( "2 + 3;", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err )
  console.log( this.name.bold.green, result )
}).debugEvents()


/**/
// Example 2 - Something slightly more complex
Sandbox("Some regular code").run( "(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 3 - Plugin based api
Sandbox("Say hello using console plugin").run( "console.log('hello, world')", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 4 - Syntax error
Sandbox({name: "Yes this is not a program"}).run( "lol)hai", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 5 - Restricted code
s = new Sandbox({name: "You won't access this kind of variable"})
s.run( "process.platform", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 6 - Something more complex
s = new Sandbox({name: "Throwing a useful stack"})
s.run(
"function example(name) { throw Error('this is a dummy error '+ name || 'you') }\
 (function toto() {example('Florian')})()", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**//*
// Example 7 - Long loop
Sandbox("This is a looooong synchronous loop")
  .run( "for( var i=0; i<10000000; i++) {if(!(i%1000000)) console.log('-',i/1000000,'-')} i;", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**//*
// Example 8 - Using interval
Sandbox({name: "Timeouting Interval"}).run( "setInterval(function(){console.log('==>hello')}, 20)", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
  return setTimeout(this.emit.bind(this,"shovel::exit"), 100)
}).on("sandbox::stop", function(){console.log("------ stopppppppppppped ! ------")})

/**/
Sandbox({name: "Small timeout"}).run( "setTimeout(function(){console.log('==>hello'); exports.hello='world'}, 20)", function( err, result, exp ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result, exp )
  return true //setTimeout(this.emit.bind(this,"shovel::exit"), 100)
}).debugEvents().on("sandbox::stop", function(){console.log("------ stopppppppppppped ! ------")})

/**//*
// Example 9 - Infinite loop
Sandbox("I will continue forever.. but the timeout").run( "i=0 ; while (true) {if(!i%1000) console.log('Example 9 ->', ++i)}", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).onAny(function() {console.log(this.name, this.event.cyan, arguments)})

/**/
Sandbox("Using exports from module plugin").run( "exports.times=0; while (true) {exports.times++}", function( err, result, exports ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result, exports )
}).onAny(function() {console.log(this.name, this.event.cyan, arguments)})

/**/
Sandbox("Using underscore thanks to module plugin").run( "var _ = require('underscore'); console.log(_([{a:'hello'}, {a:'world'}]).pluck('a'))",
  function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).onAny(function() {console.log(this.name, this.event.cyan, arguments)})

/**/
Sandbox("Using the request plugin").run(
 "var request = require('request');\
  request('http://www.google.fr', function(err, response, body) {\
    console.log(response.statusCode);\
  });\
  request('http://www.google.com', function(err, response, body) {\
    console.log(response.statusCode);\
  });", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**//*
Sandbox("CPU Burner").run("\
function pi() {\n\
  var max = 1000000;\n\
  var n=1;\n\
  var N=1;\n\
  function compte() {\n\
    n=n+2;\n\
    N=N-(1/n);\n\
    n=n+2;\n\
    N=N+(1/n);\n\
    PI=4*N;\n\
    console.log('PI :', PI);\n\
  };\n\
  var i = 1;\n\
  while (i < max) {\n\
    compte();\n\
    i = i + 4;\n\
  }\n\
}\n\
pi()", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
})

/**/
Sandbox({
  name:"Invoke my main!",
  plugins: [
      Sandbox.plugins.console,
      Sandbox.plugins.timeout,
      Sandbox.plugins.cpulimit,
      Sandbox.plugins.module,
      Sandbox.plugins.request,
      Sandbox.plugins.invoke
  ]
}).run( "function main(param) {console.log('hello', param)};", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
Sandbox("Using exports with an array").run( "exports = [ { name: 'a' }, { name: 'b' } ]",
  function( err, result, exports ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result, exports )
})

/**/
Sandbox("Using exports with an object").run( "exports = {hello: 'world'}",
  function( err, result, exports ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result, exports )
})

/**/
Sandbox("Using exports with an array in a timeout").run( "setTimeout(function(){\n\
  exports = [ { name: 'a' }, { name: 'b' } ]\n\
  }, 10)")

/**/
Sandbox("Using exports with an object in a timeout").run( "setTimeout(function(){\n\
  exports = {hello: 'world'}\n\
  }, 10)",
  function( err, result, exports ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result, exports )
})


Sandbox("Using exports with an object in a timeout").run( "setTimeout(function(){\n\
  exports = {hello: 'world'}\n\
  }, 10)")

Sandbox("Changing a key in exports in a timeout").run( "setTimeout(function(){\n\
  exports.hello = 'world'\n\
  }, 10)")

Sandbox("Using a dummy var in a timeout").run( "dummy= {}; setTimeout(function(){\n\
  dummy= {hello: 'world'}\n\
  }, 10); exports.dummy = dummy")//.on("sandbox::shovel::run", function(code){console.log('--- runtime code ---\n'.bold.blue, code, '\n------'.bold.blue)})

/**/
Sandbox("Date should also work").run( 'console.log(new Date())').debugEvents()

/**/
Sandbox("Date should also work in a loop").run( 
		'(function() {\n\
		  var data = [ {toto: 1} , {titi:2}  ];\n\
      for (var i=0; i < data.length; i++) {\n\
        data[i].test= new Date();\n\
      }\n\
      return data;\n\
    })()').debugEvents()
/**/

Sandbox("moment.js should also work thanks to module and globals plugin").run( "var moment = require('moment')\n\
    var now = moment();\n\
    console.log(now.format('dddd, MMMM Do YYYY, h:mm:ss a'));\n\
    moment.lang('fr');\n\
    console.log(now.format('LLLL'));")
    
Sandbox("eval should work").run( "eval('1+1')")
Sandbox("Date should not be extensible from inside the Sandbox as it is shared").run( "Date.toto=1").on('sandbox::return', function(err, res, exp) {
  console.log('Date.toto should be undefined :'.bold.yellow, Date.toto)
  Date.titi = 20
  console.log('but Date.titi should be 20 :'.bold.yellow, Date.titi)
  })
  
Sandbox("RegExp should work").run( "/tutu/g")
Sandbox("Boolean should work").run( "true")
Sandbox("NaN should work").run( "NaN")

