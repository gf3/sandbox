"use strict";

const assert = require("assert");
const { spawn } = require("child_process");

describe("Sandbox callback", function () {
  describe("#eval()", function () {
    it("should report uncaught exceptions to stderr", function (done) {
      const child = spawn("node", [
        "--abort-on-uncaught-exception",
        "-e",
        "const Sandbox = require('.'); s = new Sandbox(); s.eval('1 + 1', function(){ throw 'lol' })",
      ]);

      let output = "";

      child.stderr.on("data", function (chunk) {
        output += chunk.toString();
      });

      child.on("exit", function () {
        // Extra output due to `--abort-on-uncaught-exception` flag, we only
        // care about our output which is luckily just the first line
        const line = output.split(/\n/)[0];

        assert.equal(line, "Uncaught 'lol'");

        done();
      });
    });
  });
});
