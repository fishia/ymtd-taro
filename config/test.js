// 打测试包时的编译配置
// 注意 NODE_ENV 设为 'production' 是为了减少打包后的体积
// 因此判断环境时请使用 process.env.ENV 而不是 NODE_ENV
const argv = process.argv || []
const argvString = argv.join(' ')

const isDebugMessage = argvString.indexOf('--message') !== -1
const isDebugRedux = argvString.indexOf('--redux') !== -1

const isDebugReport = argvString.indexOf('--no-report') <= -1

module.exports = {
  env: {
    NODE_ENV: '"production"',
    ENV: '"development"',

    DEBUG_REPORT: isDebugReport ? '"on"' : '"off"',
    DEBUG_MESSAGE: isDebugMessage ? '"on"' : '"off"',
    DEBUG_REDUX: isDebugRedux ? '"on"' : '"off"',
  },
  mini: {
    debugReact: false,
  },
}
