<h1 align="center">:beach_umbrella: sandbox</h1>

<p align="center">
  A nifty JavaScript sandbox for Node.js.
  <br />
  <a href="https://github.com/gf3/sandbox/releases"><img src="https://img.shields.io/github/v/release/gf3/sandbox" alt="Latest Release"></a>
  <a href="https://github.com/gf3/sandbox/actions"><img src="https://github.com/gf3/sandbox/actions/workflows/tests.yml/badge.svg?branch=sandbox-neon" alt="Build Status"></a>
</p>

## What is it?

**It can...**

- [x] Be used to execute untrusted code
- [ ] Timeout long-running code and infinite loops
- [x] Handle errors gracefully
- [x] Run restricted code
- [x] Pass rich data structures back
- [ ] Capture console output

```js
const s = new Sandbox();

s.eval("const o = { answer: 4.2 }; o", function(err, res) {
  console.log("The answer is: %d", res.answer * 10);
});
```

## Installation

```sh
npm install --save sandbox
```

## Learn More

To learn more about Neon, see the [Neon documentation](https://neon-bindings.com).

To learn more about Rust, see the [Rust documentation](https://www.rust-lang.org).

To learn more about Node, see the [Node documentation](https://nodejs.org).
