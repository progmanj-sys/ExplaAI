const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    background: path.resolve(__dirname, 'ExplaAI/background.js'),
    content: path.resolve(__dirname, 'ExplaAI/worker.js'), // або content.js, якщо він так називається
    popup: path.resolve(__dirname, 'ExplaAI/popup.js'),
    sidepanel: path.resolve(__dirname, 'ExplaAI/sidepanel.js'),
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
      template: path.resolve(__dirname, 'ExplaAI/popup.html'),
      chunks: ['popup'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'sidepanel.html',
      template: path.resolve(__dirname, 'ExplaAI/sidepanel.html'),
      chunks: ['sidepanel'],
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'ExplaAI/manifest.json', to: '.' },
        { from: 'ExplaAI/images', to: 'images', noErrorOnMissing: true },
        { from: 'ExplaAI/fonts', to: 'fonts', noErrorOnMissing: true },
      ],
    }),
  ],
  optimization: { splitChunks: { chunks: 'all' } },
};
