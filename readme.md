# 医脉同道 · Taro (M 站和小程序)

## 重要说明

现在开发模式（`yarn dev`）默认不会启动火山引擎的上报功能，需要在启动指令后面加上 ` --report` 后缀才会启动；
还可以添加 ` --message` 后缀来打印输出 IM 消息；
还可以添加 ` --redux` 后缀来打印输出前端全局状态。

打测试包（`yarn build-test`）默认开启火山引擎上报功能，如果不想开启，请添加 `--no-report` 后缀；
打生产包（`yarn build-prod`）始终会开启火山引擎上报功能。

---

## 需要安装的工具

在本机运行此项目，需要安装了 Node.js v14，注意版本号不能太高，下载地址：[点我前往](https://nodejs.org/dist/v14.20.1/)。

小程序开发工具下载页面：[点我前往](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
小程序开发时，需要配置 AppID（主界面右上角“详情”按钮点开后，菜单中可以设置 AppID。注意 AppID 如果不正确登录会失败）：

- 测试 AppID： `wx69366cf26256bb87`
- 线上 AppID： `wx9f45761e6079fb3f`

---

## 准备工作

```bash
# 强烈建议安装 yarn 代替 npm，它的功能更强
# 只需运行一次即可
npm install --global yarn

# 强烈建议把仓库地址换成国内的地址，这样下载速度会更快
# 只需运行一次即可
yarn config set registry https://registry.npmmirror.com

# 必须安装 Taro 的 cli 工具，这是必备的组件
# 只需要运行一次即可
yarn global add @tarojs/cli@3.3.13
```

---

## 运行项目

```bash
# 安装项目的依赖
# 第一次使用时必须执行，以后则无需每次运行都执行，除非项目的依赖有更新
yarn

# 实时编译调试小程序（测试环境），代码产物位于 /dist/weapp 目录下，用小程序开发工具导入它
yarn dev

# 打包编译小程序（测试环境），打包后的产物位于 /dist/weapp 目录下，用小程序开发工具导入它
yarn build-test

# 打包编译小程序（生产环境），打包后的产物位于 /dist/weapp 目录下，用小程序开发工具导入它
yarn build-prod
```

(以下为额外运行方式)  
开发调试运行时，火山埋点是默认关闭的，而打包时火山埋点是默认开启的。
可以通过这些方式开启/关闭火山埋点调试等功能：

```bash
# 开发运行可以添加 --report 后缀开启火山埋点
yarn dev --report

# 可以添加 --message 后缀开启 IM 消息调试
yarn dev --message

# 可以添加 --redux 后缀开启前端数据调试
yarn dev --redux

# 打测试包时，火山埋点默认是开启的
# 如果不需要，可以通过 --no-report 后缀来关闭火山埋点
yarn build-test --no-report
```

---

## 开发指南

原开发指南已迁移至[钉钉文档](https://alidocs.dingtalk.com/i/nodes/6wPdlBDrQk4JY0lppk3LVXKx72oEGeL5)。

请注意，使用 Prettier 格式化样式文件时会自动把大写 `PX` 转换成小写 `px`，在 Taro 中这会导致问题，因此项目中配置了 Prettier 对样式文件禁用。如果想格式化样式文件，建议使用其他格式化工具。

以 VSCode 为例，按下 Ctrl + Shift + P 快捷键（macOS 则是 Command + Shift + P），选择 “首选项：打开工作区设置”，在打开的文件中填入内容：

```json
{
  "[scss]": {
    "editor.defaultFormatter": "vscode.css-language-features"
  },
  "[css]": {
    "editor.defaultFormatter": "vscode.css-language-features"
  }
}
```
