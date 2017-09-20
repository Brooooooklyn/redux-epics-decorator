require('rxjs/Rx')

var __karmaWebpackManifest__ = []

var testsContext = require.context('.', true, /\.spec\.tsx?$/)

function inManifest (path) {
  return __karmaWebpackManifest__.indexOf(path) >= 0
}

var runnable = testsContext.keys().filter(inManifest)

if (!runnable.length) {
  runnable = testsContext.keys()
}

runnable.forEach(testsContext)
