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

By default the package will attempt to download the corresponding binary release
for your platform. If you wish to skip this action you can set the
`SANDBOX_SKIP_DOWNLOAD` environment variable:

```sh
env SANDBOX_SKIP_DOWNLOAD=1 npm install --save sandbox
```

## About

`sandbox` is a tool to allow safe local execution of JavaScript.

The previous version of `sandbox` attempted to accomplish this by spawning a
child process and running the untrusted code in a new Node.js context with known
exploits patched. Unfortunately this didn't work well from a security standpoint
and it became increasingly difficult to keep up with the whack-a-mole of
security vulnerabilities. In fact, the previous version still has unaddressed
vulnerabilities that are impossible to patch with that architecture.

The current version of `sandbox` takes a new approach—it embeds a JavaScript
interpreter in the library which executes code in a separate context in another
thread. This is made possible with the help of two incredible projects:

- [Boa][doc-boa] - a JavaScript interpreter written in [Rust][doc-rust]
- [Neon][doc-neon] - a library for interfacing with [Node-API][node-napi]

The major drawback to this approach is that it either requires the user to build
the `sandbox` locally from source (which requires the user to have the rust
build tools onhand) or pre-built binaries for every platform would need to be
provided. In order to make things a little more seamless for users, we've opted
to provided pre-built binaries for the following platforms:

- Linux x86_64
- MacOS arm64
- MacOS x86_64
- Windows x86_64

Given these targets we should be able to meet the needs of most users.

## Building

First, if you don't already have the rust toolchain installed you can follow the
instructions for installing rustup:

[Install rust][rust-install].

Next, running `npm run build` will attempt to build the project with
[cargo][doc-cargo] and move the compiled binary to `./index.node`.

At this point you should be able to work with `sandbox` and run the tests: `npm
test`.

## Learn More

To learn more about Neon, see the [Neon documentation][doc-neon].

To learn more about Rust, see the [Rust documentation][doc-rust].

To learn more about Node, see the [Node documentation][doc-node].

[doc-boa]: https://github.com/boa-dev/boa
[doc-cargo]: https://doc.rust-lang.org/stable/cargo/
[doc-neon]: https://neon-bindings.com
[doc-node]: https://nodejs.org
[doc-rust]: https://www.rust-lang.org
[node-napi]: https://nodejs.org/dist/latest-v14.x/docs/api/n-api.html#n_api_node_api
[rust-install]: https://www.rust-lang.org/tools/install
