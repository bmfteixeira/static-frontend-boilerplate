var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
      app: './src/js/app.js',
      preRender: './src/js/preRender.js'
    },
    output: {
      path: './tmp/assets/',
      filename: '[name].js'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({ output: { comments: false }})
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel', //could also be written 'babel-loader'
            exclude: /node_modules/ // increases performance
        }, {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules', 'prosemirror')
          ],
          // Need this here for prosemirror til it has own .babelrc
          query: {
            presets: ['es2015']
          }
        }]
    }
};
