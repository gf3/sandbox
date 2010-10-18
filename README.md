# Node Sandbox

A rudimentary javascript sandbox for use with node.js.

## Some features

- Can be used to execute untrusted code.
- Support for timeouts (e.g. prevent infinite loops)
- Handles errors gracefully
- Restricted code (cannot access NodeJS methods)

## Example

Be sure to check out example/example.js

    var s = new Sandbox()
    s.run( '1 + 1 + " apples"', function( output ) {
      // output == "2 apples"
    })

## Documentation

Coming soon!

Basic syntax: `sandbox_instance.run( code_string, hollaback_function )`

## Installation & Running

Let's get it!

    git clone git://github.com/gf3/node-sandbox.git

And run some examples:

    node example/example.js

## Tests

    npm install async_testing
    node spec/sandbox.spec.js

## Author

- Written by [Gianni Chiappetta](http://github.com/gf3) &ndash; [gf3.ca](http://gf3.ca)
- Updates by [Dominic Tarr](http://github.com/dominictarr) &ndash; [cyber-hobo.blogspot.com](http://cyber-hobo.blogspot.com/)

