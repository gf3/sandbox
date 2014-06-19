# Node Sandbox

A nifty javascript sandbox for node.js.


## Some features

- Can be used to execute untrusted code.
- Support for timeouts (e.g. prevent infinite loops)
- Support for memory errors (and memory errors)
- Handles errors gracefully
- Restricted code (cannot access node.js methods)
- Supports `console.log` and `print` utility methods
- Supports interprocess messaging with the sandboxed code


## Example

Be sure to check out [example/example.js](https://github.com/gf3/sandbox/blob/master/example/example.js)

```javascript
var s = new Sandbox();
s.run('1 + 1 + " apples"', function(output) {
  // output.result == "2 apples"
});
```


## Documentation

### `Sandbox`#`run`(`code`, `hollaback`)

* `code` {`String`} — string of Javascript to be executed.
* `hollaback` {`Function`} — called after execution with a single argument, `output`.
    - `output` is an object with two properties: `result` and `console`. The `result`
      property is an inspected string of the return value of the code. The `console`
      property is an array of all console output.

For example, given the following code:

```javascript
function add(a, b){
  console.log(a);
  console.log(b);
  return a + b;
}

add(20, 22);
```

The resulting output object is:

```javascript
{
  result: "42",
  console: ["20", "22"]
}
```

### `Sandbox`#`postMessage`(`message`)

* `message` {`String`} - message to send to the sandboxed code

For example, the following code will send a message from outside of the sandbox in
and then the sandboxed code will respond with its own message. Note that the sandboxed
code handles incoming messages by defining a global `onmessage` function and can
send messages to the outside using the `postMessage` function.

Sandboxed code:
```javascript
onmessage = function(message){
  if (message === 'hello from outside') {
    postMessage('hello from inside');
  }
};
```

Sandbox:
```
var sandbox = new Sandbox();
sandbox.run(sandboxed_code);
sandbox.on('message', function(message){
  // Handle message sent from the inside
  // In this example message will be 'hello from inside'
});
sandbox.postMessage('hello from outside');
```

The process will ONLY be considered finished if `onmessage` is NOT a function.
If `onmessage` is defined the sandbox will assume that it is waiting for an
incoming message.


## Installation & Running

Let's get it! The easiest way is through npm:

    npm install sandbox

Or if you'd like to play with the code, see the examples, run the tests,
what-the-fuck-ever...

    git clone git://github.com/gf3/sandbox.git

And run some examples:

    node example/example.js


## Tests

To run the tests simply run the test file with node.

    npm test


## License

Sandbox is [UNLICENSED](http://unlicense.org/).


## Contributors

- [Gianni Chiappetta](http://github.com/gf3) – [gf3.ca](http://gf3.ca)
- [Bradley Meck](https://github.com/bmeck)
- [Dominic Tarr](http://github.com/dominictarr) – [cyber-hobo.blogspot.com](http://cyber-hobo.blogspot.com/)
- [Eli Mallon](https://github.com/iameli) – [iame.li](http://iame.li/)
- [Evan Schwartz](https://github.com/emschwartz)
