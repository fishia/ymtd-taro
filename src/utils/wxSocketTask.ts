export default class Ws {
  public socketTask?: WechatMiniprogram.SocketTask

  public readyState: number = 3
  public url: string

  public onopen?: Function
  public onclose?: Function
  public onerror?: Function
  public onmessage?: Function

  constructor(options: WechatMiniprogram.ConnectSocketOption) {
    this.readyState = 0
    this.socketTask = wx.connectSocket(options)
    this.url = options.url

    this.socketTask.onOpen(() => {
      this.readyState = 1
      this.onopen?.()
    })

    this.socketTask.onClose(() => {
      this.readyState = 3
      this.onclose?.()
    })

    this.socketTask.onError(() => {
      this.readyState = 3
      this.onerror?.()
    })

    this.socketTask.onMessage((message: any) => {
      // ios 缺少 0x00 导致解析失败

      if (message && message.data) {
        let value = message.data

        let code = value.charCodeAt(value.length - 1)

        if (code !== 0x00) {
          value += String.fromCharCode(0x00)

          message.data = value
        }
      }
      this.onmessage?.(message)
    })
  }

  send(data: any) {
    this.socketTask?.send({ data })
  }

  close(code?: number, reason?: string) {
    this.socketTask?.close({ code, reason })
  }
}
