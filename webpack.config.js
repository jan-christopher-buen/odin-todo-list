const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv) => ({
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devtool: argv.mode === 'development' ? 'eval-source-map' : false,
  plugins: [new HtmlWebpackPlugin({ template: './src/template.html' })],
  devServer: {
    host: 'localhost',
    port: 8080,
    static: false,
    watchFiles: ['./src/template.html'],
  },
});
