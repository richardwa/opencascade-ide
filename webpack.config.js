const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./index.tsx",
  devtool: 'inline-source-map',
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
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ],
  node: {
    fs: "empty"
  }
};
