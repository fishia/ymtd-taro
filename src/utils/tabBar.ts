import weappConfig from '@/app.config'

export function getCurrentTabBarIndex(pagePath: string): number {
  const currentPath = normalizePathWithSlashPrefix(pagePath)
  const mainPageUrls: string[] = weappConfig.tabBar.list.map(item =>
    normalizePathWithSlashPrefix(item.pagePath)
  )

  const index = mainPageUrls.findIndex(item => item === currentPath)

  return Math.max(0, index)
}

function normalizePathWithSlashPrefix(path: string): string {
  if (!path) {
    return ''
  }

  return path.startsWith('/') ? path : '/' + path
}
