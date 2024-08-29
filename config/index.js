import path from 'path'

const plugins = [
  ['@tarojs/plugin-inject', { components: { Button: { bindchooseavatar: 'eh' } } }],
  path.resolve(__dirname, './projectConfig'),
]

if (process.env.MP_UPLOAD) {
  plugins.push(path.resolve(__dirname, './autoUpload'))
}

const config = {
  projectName: 'ymtd-taro',
  date: '2021-04-16',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  plugins,
  defineConstants: {},
  // 路径别名
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
  framework: 'react',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024, // 设定转换尺寸上限
        },
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    sass: {
      resource: [
        path.resolve(__dirname, '..', 'src/assets/styles/variables.weapp.scss'),
        path.resolve(__dirname, '..', 'src/assets/styles/atom.scss'),
      ],
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
    },
    optimizeMainPackage: {
      enable: process.env.NODE_ENV !== 'development',
    },
  },
}

module.exports = function (merge) {
  if (process.env.TESTING) {
    return merge({}, config, require('./test'))
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }

  return merge({}, config, require('./prod'))
}
