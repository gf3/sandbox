var Sandbox = require("../lib/sandbox")
  , s;

// Example 1 - Standard JS
s = new Sandbox({name: "Example 1"})
s.run( "1 + 1", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 2"})
// Example 2 - Something slightly more complex
s.run( "(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 3"})
// Example 3 - Plugin based api
s.run( "console.log('hello, world')", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 4"})
// Example 4 - Syntax error
s.run( "lol)hai", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 5"})
// Example 5 - Restricted code
s.run( "process.platform", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 6"})
// Example 6 - Something more complex
s.run(
"function example(name) { throw Error('this is a dummy error '+ name || 'you') }\
 (function toto() {example('Florian')})()", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 7"})
// Example 7 - Long loop
s.run( "for( var i=0; i<10000000; i++) {if(!(i%100000)) console.log('-',i/100000,'-')}", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 8"})
// Example 8 - Using interval
s.run( "setInterval(function(){console.log('==>hello')}, 20)", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 9"})
// Example 9 - Infinite loop
s.run( "while (true) {console.log('...')}", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 10"})
s.run( "exports.times=0; while (true) {exports.times++}", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

s = new Sandbox({name: "Example 11"})
s.run( "var _ = require('underscore'); console.log(_([{a:'hello'}, {a:'world'}]).pluck('a'))", function( err, result ) {
  if(err) return console.log( (this.name +" error:").bold.red, err.refinedStack )
  console.log( this.name.bold.green, result )
}.bind(s))

