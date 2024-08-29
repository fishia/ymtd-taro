// 生产环境的编译配置
module.exports = {
  env: {
    NODE_ENV: '"production"',
    ENV: '"production"',
  },
  mini: {
    debugReact: false,
    // uglify: {
    //   enable: true,
    //   config: {
    //     // 配置项同 https://github.com/mishoo/UglifyJS2#minify-options
    //   }
    // }
  },
}
