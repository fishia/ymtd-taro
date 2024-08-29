import { useRouter } from '@tarojs/taro'

import { decodeURLParam } from '@/services/StringService'

export function useRouterParam(): Record<string, string> {
  const router = useRouter()
  const { scene, ...params } = router.params
  return {
    ...params,
    scene: decodeURIComponent(scene || ''),
    ...decodeURLParam(decodeURIComponent(scene || '')),
  }
}
