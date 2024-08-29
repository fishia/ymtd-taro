import { Client } from '@stomp/stompjs'
import Taro, { getStorageSync, nextTick } from '@tarojs/taro'
import { useReactive } from 'ahooks'
import { useEffect, useRef, useState } from 'react'

import { handleUrl } from '@/apis/client/handleRequestOption'
import { APP_TOKEN_FLAG, MAI_SOCKET_HOST } from '@/config'
import { chatListItem } from '@/def/MAI'
import Ws from '@/utils/wxSocketTask'

export enum senceData {
  PROFILE = 'profile',
  WORK = 'work',
  EDUCATION = 'education',
}

export const senceDataText = {
  [senceData.EDUCATION]: {
    text: '校园经历',
    placeHolder: '请输入校园经历的关键词信息',
  },
  [senceData.PROFILE]: {
    text: '简历内容',
    placeHolder: '输入基本信息、期望职位、工作经历、教…',
  },
  [senceData.WORK]: {
    text: '工作内容',
    placeHolder: '请输入本段工作的关键词信息',
  },
}

interface senceProps {
  sence?: string
  initData?: {
    work: any
    education: any
  }
}

const useMaiSocket = (props: senceProps) => {
  const { sence = senceData.PROFILE, initData } = props
  const clientRef = useRef<Client>()
  const subscribeData = useReactive<{ content: chatListItem; connectState: boolean }>({
    content: {} as chatListItem,
    connectState: true, // true为连接上，false为断开连接
  })
  //   const [uuid, setUuid] = useState<string>('')
  const connect = (isInit?: boolean) => {
    const Authorization = getStorageSync(APP_TOKEN_FLAG)
    const client = new Client({
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 0,

      connectHeaders: {
        Authorization,
        Platform: '3',
      },

      onConnect() {
        // Taro.showToast({ title: '连接成功', icon: 'none' })

        // 接收订阅特定 path 的消息
        subscribe()
        subscribeData.connectState = true
        // 用来判断是否第一次进入页面，第一次调动初始化，其他不用
        if (isInit) {
          nextTick(() => {
            init(initData)
          })
        }
      },

      onDisconnect() {
        subscribeData.connectState = false
        // Taro.showToast({ title: '已断开', icon: 'none' })
      },

      // 开启调试
      debug(str) {
        console.log('STOMP: ' + str)
      },

      webSocketFactory() {
        return new Ws({
          url: MAI_SOCKET_HOST,
          timeout: 30000,
          protocols: ['v12.stomp', 'v11.stomp', 'v10.stomp'], // ← 这是 stomp 的协议，必须写
          header: {
            Authorization,
            Platform: '3',
          },
        })
      },

      // 发生错误的监听
      onStompError(frame) {
        console.info('Broker reported error:' + frame.headers['message'])
        console.info('Additional details:' + frame.body)
        console.log(frame)
      },

      onWebSocketError(e) {
        console.log(e)
      },
      onUnhandledMessage(e) {
        console.log(e)
      },
    })

    client.activate()

    clientRef.current = client
  }

  // 断开链接
  const disconnect = () => {
    stop()
    clientRef.current?.deactivate()
  }

  const commonPublish = (url, body?: any) => {
    clientRef.current?.publish({
      destination: url,
      //   headers: {
      //     Authorization: 'Bearer 439453',
      //     Platform: '3',
      //   },
      body: JSON.stringify({
        scene: sence,
        ...body,
      }),
    })
  }

  // 发送消息
  const send = (inputVal, uuid?: string, type?: string) => {
    const body = {
      uuid,
      type,
      message: inputVal,
      scene: sence,
    }
    commonPublish('/mai/completions', body)
  }

  // 点击按钮发起聊天，用户没有具体对话内容，触发mai发送相关内容
  const noTextSend = uuid => {
    const body = {
      uuid,
      scene: sence,
    }
    commonPublish('/mai/click/response', body)
  }

  const subscribe = () => {
    // 接收订阅特定 path 的消息
    clientRef.current?.subscribe('/user/topic/mai', (message: any) => {
      // console.log(JSON.parse(message.body))
      // console.log(`★ 收到消息:\n${message.body}`)
      subscribeData.content = JSON.parse(message.body)
      //   setUuid(message.body.uuid)
      //   const content = text.concat(JSON.parse(message.body).content)
      //   setText(content)
    })
  }

  // const unsubscribe = inputVal => {
  //   clientRef.current?.publish({
  //     destination: '/app/stream-conversation',
  //     body: JSON.stringify({ content: inputVal }),
  //   })
  // }

  // 初始化对话地址
  const init = (body?: any) => {
    commonPublish('/mai/init', body)
  }

  // 停止接收
  const stop = () => {
    commonPublish('/mai/stop')
  }

  return {
    send,
    subscribeData: subscribeData.content,
    connect,
    disconnect,
    init,
    stop,
    connectState: subscribeData.connectState,
    noTextSend,
  }
}

export default useMaiSocket
