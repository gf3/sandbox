# Node Sandbox

A nifty javascript sandbox for node.js.

## Some features

- Can be used to execute untrusted code.
- Support for timeouts (e.g. prevent infinite loops)
- Handles errors gracefully
- Restricted code (cannot access node.js methods)
- Supports `console.log` and `print` utility methods

## Example

Be sure to check out example/example.js

    var s = new Sandbox()
    s.run( '1 + 1 + " apples"', function( output ) {
      // output.result == "2 apples"
    })

## Documentation

Basic syntax: `sandbox_instance.run( code, hollaback )`

`code` is the string of Javascript to be executed.

`hollaback` is a function, and it's called with a single argument, `output`.

`output` is an object with two properties: `result` and `console`. The `result`
property is an inspected string of the return value of the code. The `console`
property is an array of all console output.

For example, given the following code:

    function add( a, b ){
      console.log( a )
      console.log( b )
      return a + b
    }
    add( 20, 22 )

The resulting output object is:

    { result: "42"
    , console: [ "20", "22" ]
    }

## Installation & Running

Let's get it! The easiest way is through npm:

    npm install sandbox

Or if you'd like to play with the code, see the examples, run the tests,
what-the-fuck-ever...

    git clone git://github.com/gf3/sandbox.git

And run some examples:

    node example/example.js

## Tests

To run the tests you'll have to install async_testing, then simply run the spec
files from node.

    npm install async_testing
    node spec/sandbox.spec.js

## License

Sandbox is [UNLICENSED](http://unlicense.org/).

## Author

- Written by [Gianni Chiappetta](http://github.com/gf3) &ndash; [gf3.ca](http://gf3.ca)
- Contributions by [Dominic Tarr](http://github.com/dominictarr) &ndash; [cyber-hobo.blogspot.com](http://cyber-hobo.blogspot.com/)

