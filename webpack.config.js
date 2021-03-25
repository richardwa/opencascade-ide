const path = require('path');
const fs = require('fs');

module.exports = {
  entry: "./client/index.js",
  devServer: {
    contentBase: path.join(__dirname, './dist'),
    compress: true,
    port: 9000,
    open: true
  },
  module: {
    rules: [
      {
        test: /opencascade\.wasm\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader"
      }
    ]
  },
  node: {
    fs: "empty"
  }
};
