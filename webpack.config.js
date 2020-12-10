const path = require("path");
const webpackNodeExternals = require("webpack-node-externals");
const nodemonWebpackPlugin = require("nodemon-webpack-plugin");

module.exports = {
  target: "node",
  entry: {
    app: path.resolve(__dirname, "index.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  externals: [webpackNodeExternals()], // avisa a webpack que los librerias nativas no las tranpile
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [
    new nodemonWebpackPlugin({
      nodeArgs: "--inspect=0.0.0.0:7777",
    }),
  ],
  devtool: "inline-source-map",
};
