'use strict';

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const srcPath = path.join(__dirname, './src');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    helpers: ['./src/helpers/componentStore.js', './src/helpers/formRenderer.js'],
    bundle: ['./src/index.jsx']
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    library: { type: "module" },
    environment: { module: true },
  },
  experiments: {
    outputModule: true,
  },
  externals: ['react', 'react-dom'],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: 'asset/inline'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  resolve: {
    alias: {
      components: srcPath + '/components/',
      src: srcPath
    },
    extensions: ['.js', '.jsx', '.json']
  }
};