export interface INetworkPollingOptions {
  timeout?: number
  interval?: number
}

/**
 * 发起轮询请求，直到满足指定条件或超时
 * @param fetcher 轮询请求的方法
 * @param isComplete 判断轮询请求结果是否完成的回调
 * @param options 配置项（timeout=超时时间，interval=轮询间隔）
 * @returns 成功时返回轮询结果
 */
export async function polling<T>(
  fetcher: () => Promise<any>,
  isComplete: (data: any) => boolean,
  options?: INetworkPollingOptions
): Promise<T> {
  const { timeout = 60 * 1000, interval = 500 } = options || {}

  let timeoutId = -1
  const end = timeout + new Date().getTime()

  return new Promise((resolve, reject) => {
    function fetch() {
      fetcher()
        .then(result => {
          if (isComplete(result)) {
            clearTimeout(timeoutId)
            resolve(result)
          } else {
            if (new Date().getTime() >= end) {
              reject()
            } else {
              timeoutId = +setTimeout(fetch, interval)
            }
          }
        })
        .catch(reject)
    }

    fetch()
  })
}
