const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('path')

const rules = [
  {
    test: /\.tsx?$/,
    loader: 'ts-loader',
    options: {
      configFile: resolve(process.cwd(), 'test', 'tsconfig.json'),
    },
    exclude: /node_modules/
  }
]

if (process.env.NODE_ENV === 'test') {
  rules.push({
    test: /src\/.+\.ts$/,
    exclude: /(node_modules|\.spec\.ts$)/,
    loader: 'istanbul-instrumenter-loader',
    enforce: 'post',
    options: {
      esModules: true
    }
  })
}

module.exports = {
  entry: './test/index.tsx',

  devtool: 'inline-source-map',

  output: {
    path: resolve(process.cwd(), 'dist'),
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
  },

  module: { rules },

  devServer: {
    contentBase: resolve(process.cwd(), 'dist'),
    port: 8080
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './test/index.html'
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `'${ process.env.NODE_ENV }'`
    })
  ],

  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ReactContext': true,
    'react/lib/ExecutionEnvironment': true
  }
}
