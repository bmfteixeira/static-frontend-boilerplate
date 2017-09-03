var path = require('path');
module.exports = {
    devtool: 'source-map',
    entry: {
      app: './src/js/app.js',
      preRender: './src/js/preRender.js'
    },
    output: {
      path: './public/assets/',
      filename: '[name].js'
    },
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
}
