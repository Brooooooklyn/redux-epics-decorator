const path = require('path')
const webpackTestConfig = require('./webpack.config')

module.exports = function (config) {
  return {
    basePath: path.join(__dirname, '../'),

    frameworks: ['mocha'],

    files: [
      './test/spec-bundle.js'
    ],

    preprocessors: {
      './test/spec-bundle.js': [
        'webpack'
      ]
    },

    webpack: webpackTestConfig,

    webpackMiddleware: {
      noInfo: true,
      quiet: false,
      stats: 'errors-only'
    },

    reporters: [
      'mocha-reporter'
    ],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    browsers: ['Chrome_without_sandbox'],

    captureTimeout: 60000,

    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-webpack-with-fast-source-maps',
      'karma-mocha-reporter'
    ],

    customLaunchers: {
      Chrome_without_sandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox'
        ]
      }
    }
  }
}
