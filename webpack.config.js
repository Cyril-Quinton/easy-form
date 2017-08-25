const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    library: 'formx',

    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
};
