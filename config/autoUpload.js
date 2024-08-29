const simpleGit = require('simple-git')
const miniprogramCI = require('miniprogram-ci')
const ObsClient = require('esdk-obs-nodejs')
const DingtalkBot = require('dingtalk-robot-sender')

const isTestEnv = process.env.NODE_ENV === 'development' || process.env.TESTING

const git = simpleGit()

module.exports = async function autoUpload(ctx) {
  const { chalk, printLog, processTypeEnum } = ctx.helper
  const { outputPath } = ctx.paths

  let desc = ''
  const isRunInDevCloud = process.env.DEV_CLOUD
  if (isRunInDevCloud) {
    const buildNumber = process.env.DEV_CLOUD_NO
    const todayBuildNumber = (process.env.DEV_CLOUD_BDNO || '').split('.')[1] || ''
    desc += `流水线第 ${buildNumber} 次构建，今日第 ${todayBuildNumber} 次，`
  } else {
    const username = ((await git.getConfig('user.name')) || {}).value || '未知'
    const email = ((await git.getConfig('user.email')) || {}).value || '未知'
    desc += `用户：${username}，邮箱：${email}，`
  }
  const branchName = await git.revparse(['--abbrev-ref', 'HEAD'])
  const commitId = await git.revparse('HEAD')
  desc += `分支：${branchName}，提交 ID：${commitId}。`

  const mpCIConfig = {
    appid: isTestEnv ? 'wx69366cf26256bb87' : 'wx9f45761e6079fb3f',
    type: 'miniProgram',
    projectPath: outputPath,
    privateKeyPath: isTestEnv ? 'config/upload_key_test.key' : 'config/upload_key_prod.key',
    ignores: ['node_modules/**/*'],
  }

  async function autoUploadPluginMain() {
    printLog(processTypeEnum.START, chalk.green(`开始上传`))
    printLog(processTypeEnum.START, chalk.green(`本次上传信息： ${desc}`))

    const project = new miniprogramCI.Project(mpCIConfig)

    const uploadResult = await miniprogramCI.upload({
      project,
      version: 'ci.latest',
      desc: `[CI 自动上传] ` + desc,
      onProgressUpdate: undefined,
    })

    if (uploadResult.subPackageInfo) {
      const allPackageInfo = uploadResult.subPackageInfo.find(item => item.name === '__FULL__')
      const mainPackageInfo = uploadResult.subPackageInfo.find(item => item.name === '__APP__')
      const extInfo = `本次上传 ${allPackageInfo.size / 1024}KiB ${
        mainPackageInfo ? '，其中主包' + mainPackageInfo.size + 'KiB' : ''
      }`
      printLog(
        processTypeEnum.REMIND,
        chalk.green(`上传成功 （${new Date().toLocaleString()}）  ${extInfo}`)
      )
    }

    const qrcodePath = outputPath + '/preview.jpg'
    await miniprogramCI.preview({
      project,
      desc,
      qrcodeFormat: 'image',
      qrcodeOutputDest: qrcodePath,
    })
    printLog(processTypeEnum.REMIND, chalk.green(`预览二维码已生成： ${qrcodePath}`))

    if (!commitId) {
      return
    }

    const obsClient = new ObsClient({
      access_key_id: 'RL7DGYPWPBR1N5UTEFIE',
      secret_access_key: 'BuMFMg4R3EV1sZ9h5VLo0mkK7mghgSSeA9FVLwac',
      server: 'https://obs.cn-north-1.myhuaweicloud.com',
    })

    const fileKey = `ymtd-c/weapp/qrcode-${isTestEnv ? 'test' : 'prod'}/${commitId}/preview.jpeg`
    const obsQrcodePath = 'https://cdn.geedos.com/' + fileKey

    await new Promise((resolve, reject) => {
      obsClient.putObject(
        {
          Bucket: 'fe4cdn',
          Key: fileKey,
          SourceFile: qrcodePath,
        },
        (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        }
      )
    })
      .then(() => {
        printLog(processTypeEnum.START, `二维码上传 OBS 成功： ${fileKey}`)
      })
      .catch(error => {
        printLog(processTypeEnum.ERROR, `二维码上传 OBS 失败 ${JSON.stringify(error)}`)
      })

    // 属性 mode 表示只在某些场景触发： test=仅测试包，prod=仅生产包，both=两者都触发
    const dingtalkBotConfigs = [
      {
        // 医脉前端
        mode: 'both',
        accessToken: '684c26dce9a9039f18663e4b3013873b361908817fad0b63b1fdefc66187a409',
        secret: 'SEC5ea9db95fe1a4b35adaef774c2b272422e4aa8d94cf6998686a43fafcccdb7ae',
      },
    ]

    dingtalkBotConfigs.forEach(config => {
      if (
        config.mode === 'both' ||
        (isTestEnv && config.mode === 'test') ||
        (!isTestEnv && config.mode === 'prod')
      ) {
        let md = ''
        md += `**医脉同道${isTestEnv ? '测试' : '生产'}小程序新版已上传**\n\n`
        md += `预览二维码：\n\n![](${obsQrcodePath})\n\n`
        md += `提交者信息：\n\n${desc}\n\n`
        md += `[前往小程序后台](https://mp.weixin.qq.com/wxamp/index/index?lang=zh_CN&token=1441877609) [前往代码仓库](https://devcloud.huaweicloud.com/codehub/project/5a1fabb857124bc585be653088a3dff2/codehub/1181580/home?ref=mp-master)`

        const dingtalkBot = new DingtalkBot({
          baseUrl: 'https://oapi.dingtalk.com/robot/send',
          ...config,
        })
        dingtalkBot.markdown('小程序新版已上传', md, { atMobiles: [], isAtAll: false })
      }
    })
  }

  const onBuildDone = ctx.onBuildComplete || ctx.onBuildFinish
  onBuildDone(autoUploadPluginMain)
}
