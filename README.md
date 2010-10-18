# Node Sandbox

A rudimentary javascript sandbox for use with node.js.

## Some features

- Can be used to execute untrusted code.
- Support for timeouts (e.g. prevent infinite loops)
- Handles errors gracefully
- Restricted code (cannot access NodeJS methods)

## Example

Be sure to check out example/example.js

    var s = new Sandbox();
    s.run('1 + 1 + " apples"', function(output) {
      // output == "2 apples"
    });

## Issues

There seems to be a race condition somewhere which sometimes prevents output from being returned properly.

**Update:** This is no longer an issue with the latest version of node.

## Documentation

Coming soon!

Basic syntax: `sandbox_instance.run(code_string, hollaback_function)`

## installation & running.

	git http://github.com/gf3/node-sandbox.git

now instruct git to download submodules (into node-sandbox/vendor)

	cd node-sandbox
	git submodule init

run an example
	cd example
	node example.js

## Author

Written by [Gianni Chiappetta](http://github.com/gf3) &ndash; [gf3.ca](http://gf3.ca)
