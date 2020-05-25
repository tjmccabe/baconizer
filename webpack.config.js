const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: [/\.jsx?$/],
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/env']
          }
        },
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin()
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '*']
  }
};