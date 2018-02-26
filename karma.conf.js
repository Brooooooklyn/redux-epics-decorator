const path = require('path')
const webpackTestConfig = require('./webpack.config')

webpackTestConfig.entry = './test/spec.entry.ts'

module.exports = function (config) {
  config.set({
    basePath: process.cwd(),

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      './test/spec.entry.ts'
    ],

    preprocessors: {
      './test/spec.entry.ts': [
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
      'mocha',
      'coverage-istanbul'
    ],

    coverageIstanbulReporter: {

      // reports can be any that are listed here: https://github.com/istanbuljs/istanbul-reports/tree/590e6b0089f67b723a1fdf57bc7ccc080ff189d7/lib
      reports: ['html', 'lcov', 'text-summary', 'json'],

        // base output directory
      dir: path.join(process.cwd(), 'coverage'),

        // if using webpack and pre-loaders, work around webpack breaking the source path
      fixWebpackSourcePaths: true,

      'report-config': {
        html: {
          subdir: 'html'
        }
      },

      thresholds: {
        statements: 90,
        lines: 95,
        branches: 95,
        functions: 95
      }
    },

    port: 9876,

    colors: true,

    singleRun: process.env.NODE_ENV === 'test',

    logLevel: config.LOG_WARN,

    browsers: [ process.env.NODE_ENV === 'test' ? 'Chrome_without_sandbox' : 'Chrome'],

    captureTimeout: 60000,

    plugins: [
      'karma-chai',
      'karma-mocha',
      'karma-sinon',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-coverage-istanbul-reporter',
      'karma-webpack'
    ],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    customLaunchers: {
      Chrome_without_sandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox'
        ]
      }
    }
  })
}
