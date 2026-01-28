// prod webpack для Chrome Extension / Manifest V3 (универсальний JS/TS + React)
// Поміняйте entry/шляхи під вашу структуру, якщо потрібно
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    // Оновіть ці шляхи під реальні файли вашого проекту
    popup: path.resolve(__dirname, 'ExplaAI/ExplaAI/popup.html'),
    sidepanel: path.resolve(__dirname, 'ExplaAI/ExplaAI/index.html'),
    background: path.resolve(__dirname, 'ExplaAI/ExplaAI/background.js'),
    content: path.resolve(__dirname, 'ExplaAI/ExplaAI/styles.css'),
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
      template: path.resolve(__dirname, 'src/popup/popup.html'),
      chunks: ['popup'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'sidepanel.html',
      template: path.resolve(__dirname, 'src/sidepanel/sidepanel.html'),
      chunks: ['sidepanel'],
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'public/icons', to: 'icons', noErrorOnMissing: true },
        { from: 'public/_locales', to: '_locales', noErrorOnMissing: true },
      ],
    }),
  ],
  optimization: { splitChunks: { chunks: 'all' } },
};
