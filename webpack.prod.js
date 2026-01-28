// webpack.prod.js — продакшн конфіг для Chrome Extension (Manifest V3)
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    background: path.resolve(__dirname, 'background.js'),
    content: path.resolve(__dirname, 'worker.js'), // твій content-скрипт
    popup: path.resolve(__dirname, 'popup.js'),
    sidepanel: path.resolve(__dirname, 'sidepanel.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }],
              '@babel/preset-react',
              '@babel/preset-typescript'
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|ico|svg)$/i,
        type: 'asset/resource',
        generator: { filename: 'assets/[name][ext]' },
      },
    ],
  },
  resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: path.resolve(__dirname, 'popup.html'),
      chunks: ['popup'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'sidepanel.html',
      template: path.resolve(__dirname, 'sidepanel.html'),
      chunks: ['sidepanel'],
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'images', to: 'images', noErrorOnMissing: true },
        { from: 'fonts', to: 'fonts', noErrorOnMissing: true },
        { from: 'explaai.css', to: '.' }, // якщо треба окремо скопіювати стилі
        { from: 'index.html', to: '.' },  // якщо index.html використовується
      ],
    }),
  ],
  optimization: { splitChunks: { chunks: 'all' } },
};
