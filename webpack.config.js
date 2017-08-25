const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'easyForm.js',
    library: 'easyForm',

    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        query: {
            cacheDirectory: true,
            plugins: ["transform-decorators-legacy"],
            presets: ['es2015']
        }
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
};
