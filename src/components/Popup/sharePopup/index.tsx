import { useEffect, useState } from 'react'
import {
  downloadFile,
  saveImageToPhotosAlbum,
  useShareAppMessage,
  getStorageSync,
  authorize,
  showLoading,
  hideLoading,
} from '@tarojs/taro'
import { ITouchEvent, View, Image, Button } from '@tarojs/components'
import R from 'ramda'
import { IProps } from '@/def/common'
import { SHARE_USER_INFO, STATIC_HOST } from '@/config'
import './index.scss'
import { useFixedBottomPopup } from '@/hooks/custom/usePopup'
import useToast from '@/hooks/custom/useToast'
import WxApp from '@/assets/imgs/popup/wxapp.png'
import Photo from '@/assets/imgs/popup/photo.png'

type shareItem = {
  text: string
  img_url: string
  openType?: string
  ClientApi: () => Promise<any>
  onClick: () => void
}
export interface IShareCard extends IProps {
  onCancel?: () => void
  cancelText?: string
  list?: shareItem[]
  shareApi?: (id: string) => Promise<any>
  generatorPhotosApi?: (avatar: string, nickname: string, id: string) => Promise<any>
  id: string
}
export interface shareData {
  title?: string
  path?: string
  imageUrl?: string
}

const ShareCard: React.FC<IShareCard> = props => {
  const [current, setCurrent] = useState<number>(0)
  const [shareData, setShareData] = useState<shareData>()
  const { open, close } = useFixedBottomPopup()
  const showToast = useToast()
  const wechatInfo = getStorageSync(SHARE_USER_INFO)
  const { avatarUrl, nickName } = wechatInfo

  const {
    id,
    generatorPhotosApi,
    shareApi,
    list = [
      {
        text: '微信好友',
        img_url: WxApp,
        openType: shareData ? 'share' : '',
        onClick: !shareData
          ? () => {
            showToast({ content: '后台正在生成图片...' })
          }
          : null,
      },
      {
        text: '生成图片',
        img_url: Photo,
        onClick: () => {
          //调Api后保存到shareData
          showLoading({ title: '生成中...', mask: true })
          generatorPhotosApi && generatorPhotosApi(id, avatarUrl, nickName)
            .then((photos: string[]) => {
              hideLoading()
              open({
                key: 'pickPhoto',
                className: 'share_swiper_container',
                carousel_images: photos.map(item => `${STATIC_HOST}/${item}`),
                title: '选择分享样式',
                current,
                showClear: true,
                overlayClickClose: true,
                confirmText: '保存图片',
                onChange: (e: ITouchEvent) => {
                  setCurrent(e.detail.current)
                },
                onConfirm: () => {
                  authorize({ scope: 'scope.writePhotosAlbum' })
                    .then(() => {
                      downloadFile({
                        url: `${STATIC_HOST}/${photos[current] ? photos[0] : photos[current]}`,
                        success: function (res) {
                          if (res.statusCode === 200) {
                            saveImageToPhotosAlbum({
                              filePath: res.tempFilePath,
                              success: () => {
                                showToast({ content: '图片已保存本地相册' })
                              },
                            })
                          }
                        },
                      })
                    })
                    .catch(() => void showToast({ content: '请授权保存图片权限以保存分享图' }))
                },
              })
            })
            .catch()
        },
      },
    ],
    onCancel,
    cancelText = '取消',
  } = props

  useEffect(() => {
    //提前调Api后保存到shareData
    shareApi && shareApi(id).then(data => {
      setShareData({
        title: data.title,
        imageUrl: `${STATIC_HOST}/${data.path}`,
      })
    })
  }, [shareApi, id])
  //不支持异步调取接口
  useShareAppMessage(res => {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let cfg: any = R.pathOr(null, ['target', 'dataset', 'share'], res)
      close()
      if (cfg) {
        return {
          ...cfg,
        }
      }
    }
  })

  return (
    <View className="shared_card">
      <View className="shared_card__images">
        {list.map((item, i) => (
          <View key={i}>
            <Button
              className="shared_card__item"
              key={i}
              openType={item.openType}
              data-share={shareData}
              onClick={item.onClick}
            >
              <Image src={item.img_url} />
              <View className="text">{item.text}</View>
            </Button>
          </View>
        ))}
      </View>
      <View className="shared_card__cancelbar">
        <View className="shared_card__cancelbtn" onClick={onCancel}>
          {cancelText}
        </View>
      </View>
    </View>
  )
}

export default ShareCard
