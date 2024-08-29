module.exports = function (ctx) {
  const { fs } = ctx.helper
  const { outputPath } = ctx.paths

  ctx.onBuildComplete(function () {
    let appId = 'wx9f45761e6079fb3f'

    if (process.env.TESTING || process.env.NODE_ENV === 'development') {
      appId = 'wx69366cf26256bb87'
    }

    const projectConfigJson = {
      appid: appId,
      compileHotReLoad: false,
    }

    fs.writeFileSync(
      outputPath + '/project.private.config.json',
      JSON.stringify(projectConfigJson),
      { flag: 'w+' }
    )
  })
}
