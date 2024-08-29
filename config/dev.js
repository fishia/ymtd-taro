// 开发环境的编译配置
const argv = process.argv || []
const argvString = argv.join(' ')

const isDebugReport = argvString.indexOf('--report') !== -1
const isDebugMessage = argvString.indexOf('--message') !== -1
const isDebugRedux = argvString.indexOf('--redux') !== -1

module.exports = {
  env: {
    NODE_ENV: '"development"',
    ENV: '"development"',

    DEBUG_REPORT: isDebugReport ? '"on"' : '"off"',
    DEBUG_MESSAGE: isDebugMessage ? '"on"' : '"off"',
    DEBUG_REDUX: isDebugRedux ? '"on"' : '"off"',
  },
  mini: {
    debugReact: true,
  },
}
