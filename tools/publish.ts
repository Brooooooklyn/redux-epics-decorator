import * as fs from 'fs'
import { resolve } from 'path'
import * as shelljs from 'shelljs'

// const tagReg = /^[0-9]+(\.[0-9]+)*(-(alpha|beta)\.[0-9]+)?/

const gitExecResult = shelljs.exec('git log -1 --pretty=%B')
const gitError = gitExecResult.stderr

if (gitError) {
  console.info(gitError)
  process.exit(1)
}

// const gitStdout = gitExecResult.stdout

// if (!tagReg.test(gitStdout)) {
//   console.info('Not a release commit.')
//   process.exit(0)
// }

const pkg = require('../package.json')
const README = fs.readFileSync(resolve(process.cwd(), 'README.md'), 'utf8')

const cjsPkg = { ...pkg, main: './index.js', typings: './index.d.ts' }

const write = (distPath: string, data: any) => {
  return new Promise((res, reject) => {
    fs.writeFile(resolve(process.cwd(), distPath), data, 'utf8', (err) => {
      if (!err) {
        return res()
      }
      reject(err)
    })
  })
}

shelljs.mv('es', 'lib/')

const cjsPkgData = JSON.stringify(cjsPkg, null, 2)

Promise.all([
  write('./lib/package.json', cjsPkgData),
  write('./lib/README.md', README),
]).catch((e: Error) => {
  console.error(e)
  process.exit(1)
})
