import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default (_env, argv) => ({
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: fileURLToPath(new URL('./dist', import.meta.url)),
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
