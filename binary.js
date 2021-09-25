const { Binary } = require("binary-install");
const os = require("os");
const { bugs, version, name, repository } = require("./package.json");

const supportedPlatforms = [
  {
    TYPE: "Windows_NT",
    ARCHITECTURE: "x64",
    RUST_TARGET: "x86_64-pc-windows-msvc",
    BINARY_NAME: "index.node",
  },
  {
    TYPE: "Linux",
    ARCHITECTURE: "x64",
    RUST_TARGET: "x86_64-unknown-linux-gnu",
    BINARY_NAME: "index.node",
  },
  {
    TYPE: "Darwin",
    ARCHITECTURE: "x64",
    RUST_TARGET: "x86_64-apple-darwin",
    BINARY_NAME: "index.node",
  },
  {
    TYPE: "Darwin",
    ARCHITECTURE: "arm64",
    RUST_TARGET: "aarch64-apple-darwin",
    BINARY_NAME: "index.node",
  },
];

function error(message) {
  console.error(message);
  process.exit(1);
}

function getPlatform() {
  const type = os.type();
  const arch = os.arch();

  for (let platform of supportedPlatforms) {
    if (type === platform.TYPE && arch === platform.ARCHITECTURE) {
      return platform;
    }
  }

  error(
    `Platform "${type}" and architecture "${arch}" are not supported by ${name}. Please file an issue: ${bugs.url}`,
  );
}

function getBinary() {
  const platform = getPlatform();
  const url = `${repository.url}/releases/download/v${version}/${name}-v${version}-${platform.RUST_TARGET}.tar.gz`;

  return new Binary(name, url);
}

function install() {
  return getBinary().install();
}

module.exports = {
  install,
};
