const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env = {}) => ({
  mode: env.prod ? 'production' : 'development',
  devtool: env.prod ? 'source-map' : 'cheap-module-eval-source-map',
  entry: path.resolve(__dirname, './src/main.js'),
  resolve: {
    alias: {
      'vue': '@vue/runtime-dom'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(scss|css)$/,
        use: [
            'style-loader',
            MiniCssExtractPlugin.loader,
            {
                loader: "css-loader",
                options: {}
            },
            {
                loader: "sass-loader",
                options: {}
            }
        ]
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      inject: true
    }),
  ],
  devServer: {
    host: '0.0.0.0',
    inline: true,
    hot: true,
    stats: 'minimal',
    contentBase: __dirname,
    overlay: true
  }
})
