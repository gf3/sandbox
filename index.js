"use strict";

const { shovelNew, shovelEval } = require("./index.node");

/**
 * Sandbox for running JavaScript.
 */
class Sandbox {
  constructor() {
    // Wrapper for boxed `Shovel`
    this._shovel = shovelNew();
  }

  /**
   * Evaluate arbitrary source code.
   */
  eval(source, callback) {
    return shovelEval.call(this._shovel, source, function (err, res) {
      try {
        callback.call(undefined, err, res);
      } catch (e) {
        console.error("Uncaught %O", e);
        throw e;
      }
    });
  }
}

module.exports = Sandbox;
