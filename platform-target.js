const http = require("https");
const fs = require("fs");
const os = require("os");
const { gunzip } = require("zlib");
const { bugs, version, name, repository } = require("./package.json");
const { debuglog, promisify } = require("util");

const PLATFORMS = [
  {
    TYPE: "Windows_NT",
    ARCHITECTURE: "x64",
    RUST_TARGET: "x86_64-pc-windows-msvc",
  },
  {
    TYPE: "Linux",
    ARCHITECTURE: "x64",
    RUST_TARGET: "x86_64-unknown-linux-gnu",
  },
  {
    TYPE: "Darwin",
    ARCHITECTURE: "x64",
    RUST_TARGET: "x86_64-apple-darwin",
  },
  {
    TYPE: "Darwin",
    ARCHITECTURE: "arm64",
    RUST_TARGET: "aarch64-apple-darwin",
  },
];
const BINARY_NAME = "index.node";

const log = debuglog("sandbox");

function error(message) {
  console.error(`💥 ${message}`);
  process.exit(1);
}

function getPlatform() {
  const type = os.type();
  const arch = os.arch();

  for (let platform of PLATFORMS) {
    if (type === platform.TYPE && arch === platform.ARCHITECTURE) {
      return platform;
    }
  }

  error(
    `Platform "${type}" and architecture "${arch}" are not supported by ${name}. Please file an issue: ${bugs.url}`,
  );
}

/**
 * @callback BufferCallback
 * @param {any} err - Error, if `undefined` the operation was successful.
 * @param {Buffer} buffer - Result of operation.
 * @returns {void}
 */

/**
 * Download a given URL to a Buffer.
 *
 * @param {string} url - URL to download.
 * @param {BufferCallback} callback - Buffer containing downloaded file.
 * @returns {void}
 */
function download(url, callback) {
  log("download: %s", url);

  const chunks = [];

  http
    .get(url, function (response) {
      log("download.response: %d", response.statusCode);

      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers &&
        response.headers.location
      ) {
        download(response.headers.location, callback);
        return;
      }

      if (response.statusCode !== 200) {
        process.nextTick(callback, `Status ${response.statusCode} for ${url}`);
        return;
      }

      response.on("data", function (chunk) {
        chunks.push(chunk);
      });
      response.on("end", function () {
        process.nextTick(callback, undefined, Buffer.concat(chunks));
      });
      response.on("error", callback);
    })
    .on("error", function (err) {
      log("download.error: %O", err);
      process.nextTick(callback, err);
    });
}

/**
 * Decompress a given Buffer.
 *
 * @param {Buffer} buffer - Compressed data.
 * @param {BufferCallback} callback - Buffer containing decompressed data.
 * @returns {void}
 */
function decompress(buffer, callback) {
  log("decompress");

  gunzip(buffer, function (err, decompressedBuffer) {
    if (err) {
      log("decompress.error: %O", err);
      process.nextTick(callback, err);
      return;
    }
    process.nextTick(callback, undefined, decompressedBuffer);
  });
}

/**
 * Save a buffer to the filesystem.
 *
 * @param {Buffer} buffer - File contents.
 * @param {string} filename - File path and name.
 * @param {Function} callback - Called with the saved filename if sucessful.
 * @returns {void}
 */
function save(buffer, filename, callback) {
  log("save: %s", filename);

  const stream = fs.createWriteStream(filename);
  const done = function () {
    stream.end();
    process.nextTick(callback, undefined, filename);
  };

  if (stream.write(buffer)) {
    done();
    return;
  } else {
    stream.once("drain", done);
  }
}

/**
 * Verify installation.
 *
 * @param {string} filename - File to verify.
 * @param {Function} callback - Called with `true` to indicate the installation
 *                              has been verified.
 * @returns {void}
 */
function verify(filename, callback) {
  log("verify: %s", filename);

  fs.existsSync(filename)
    ? process.nextTick(callback, undefined, true)
    : process.nextTick(callback, true);
}

/**
 * Determine the current platform and attempt to download and install a
 * pre-built binary.
 *
 * @returns {void}
 */
async function install() {
  const platform = getPlatform();

  log("install: %O", platform);

  if (fs.existsSync(BINARY_NAME)) {
    log("install.exists: %s", BINARY_NAME);
    console.log(`🎊 ${name} already downloaded!`);
    return;
  }

  const repositoryUrl = repository.url
    .replace("git+https", "https")
    .replace(`${name}.git`, name);
  const url = `${repositoryUrl}/releases/download/v${version}/${name}-v${version}-${platform.RUST_TARGET}.gz`;

  log("install.url: %s", url);

  try {
    const buffer = await promisify(download)(url);
    const binary = await promisify(decompress)(buffer);
    const filename = await promisify(save)(binary, BINARY_NAME);
    const verified = await promisify(verify)(filename);

    if (!verified) {
      throw new Error(`Unable to verify ${filename}`);
    }

    console.log(`🥂 Successfully downloaded ${name} ${version}`);
  } catch (err) {
    error(err);
  }
}

module.exports = {
  install,
};
