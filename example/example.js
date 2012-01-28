var Sandbox = require("../lib/sandbox")
  , s;


// Example 1 - Standard JS
Sandbox("Example 1").run( "2 + 3;", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err )
  console.log( this.name.bold.green, result )
}).debugEvents()


/**/
// Example 2 - Something slightly more complex
Sandbox("Example 2").run( "(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 3 - Plugin based api
Sandbox("Example 3").run( "console.log('hello, world')", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 4 - Syntax error
Sandbox({name: "Example 4"}).run( "lol)hai", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 5 - Restricted code
s = new Sandbox({name: "Example 5"})
s.run( "process.platform", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 6 - Something more complex
s = new Sandbox({name: "Example 6"})
s.run(
"function example(name) { throw Error('this is a dummy error '+ name || 'you') }\
 (function toto() {example('Florian')})()", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 7 - Long loop
Sandbox("Example 7")
  .run( "for( var i=0; i<10000000; i++) {if(!(i%1000000)) console.log('-',i/1000000,'-')} i;", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).debugEvents()

/**/
// Example 8 - Using interval
Sandbox({name: "Example 8"}).run( "setInterval(function(){console.log('==>hello')}, 20)", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
  return setTimeout(this.emit.bind(this,"shovel::exit"), 100)
}).on("sandbox::stop", function(){console.log("------ stopppppppppppped ! ------")})

/**/
Sandbox({name: "Example 8 bis"}).run( "setTimeout(function(){console.log('==>hello')}, 20)", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
  return true //setTimeout(this.emit.bind(this,"shovel::exit"), 100)
}).on("sandbox::stop", function(){console.log("------ stopppppppppppped ! ------")})

/**/
// Example 9 - Infinite loop
Sandbox("Example 9").run( "i=0 ; while (true) {if(!i%1000) console.log('Example 9 ->', ++i)}", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).onAny(function() {console.log(this.name, this.event.cyan, arguments)})

/**/
Sandbox("Example 10").run( "exports.times=0; while (true) {exports.times++}", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).onAny(function() {console.log(this.name, this.event.cyan, arguments)})

/**/
Sandbox("Example 11").run( "var _ = require('underscore'); console.log(_([{a:'hello'}, {a:'world'}]).pluck('a'))",
  function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}).onAny(function() {console.log(this.name, this.event.cyan, arguments)})

/**/
Sandbox("Example 12").run(
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

/**/
Sandbox("PI").run("\
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

