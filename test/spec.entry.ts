import 'rxjs'

declare const require: any

const __karmaWebpackManifest__: any[] = []

const testsContext = require.context('./specs', true, /\.spec\.tsx?$/)

function inManifest (path: string) {
  return __karmaWebpackManifest__.indexOf(path) >= 0
}

let runnable = testsContext.keys().filter(inManifest)

if (!runnable.length) {
  runnable = testsContext.keys()
}

runnable.forEach(testsContext)
