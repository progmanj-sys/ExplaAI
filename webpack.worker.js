const path = require("path");

module.exports = {
  mode: "production",
  target: "webworker",
  entry: "./src/worker-entry.js",   // новий файл
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "worker.js",
    clean: true,
  },
};
