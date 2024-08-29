// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
module.exports = {
  presets: [
    [
      'taro',
      {
        framework: 'react',
        ts: true,
        // https://babeljs.io/docs/en/babel-preset-env
        loose: false,
        useBuiltIns: false,
        // targets: "> 0.25%, not dead"
        targets: {
          chrome: '58',
          ios: '8',
          android: '5',
        },
      },
    ],
  ],
  plugins: ['lodash', 'ramda'],
}
