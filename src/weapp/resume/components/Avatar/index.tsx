import { View, Text, Image, Button } from '@tarojs/components'
import { hideLoading, showLoading, chooseMedia, getFileSystemManager } from '@tarojs/taro'
import c from 'classnames'
import { last, noop } from 'lodash'
import React, { useState } from 'react'

import { uploadAvatarApi } from '@/apis/resume'
import { ALLOW_AVATAR_FILE_TYPE, DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR } from '@/config'
import { IProps } from '@/def/common'
import { SexType } from '@/def/user'
import useModalState from '@/hooks/custom/useModalState'
import useToast from '@/hooks/custom/useToast'
import { combineStaticUrl } from '@/utils/utils'

import { IFormComponentProps } from '../Form'
import uploadIcon from './upload-icon.png'

import './index.scss'

const exampleAvatar = combineStaticUrl('/geebox/default/avatar/male-3.png')
const wrongAvatar = combineStaticUrl('/geebox/default/avatar/wrong-avatar-tip.png')

export interface IAvatarUploaderProps extends Omit<IFormComponentProps<string>, 'title'>, IProps {
  defaultSex?: SexType
}

const AvatarUploader: React.FC<IAvatarUploaderProps> = props => {
  const { value, defaultSex = SexType.boy, onChange = noop, className, style } = props

  const showToast = useToast()

  const displayImage = value
    ? combineStaticUrl(value)
    : defaultSex === SexType.girl
    ? DEFAULT_FEMALE_AVATAR
    : DEFAULT_MALE_AVATAR

  const { alive, active, setModal } = useModalState()

  const [isShowMask, setIsShowMask] = useState(true)

  const newChooseAvatarHandler = async e => {
    const tempAvatarUrl: string = e?.detail?.avatarUrl
    if (!tempAvatarUrl) {
      showToast({ content: '获取头像失败，请稍后重试' })
      return
    } else if (!ALLOW_AVATAR_FILE_TYPE.includes(last(tempAvatarUrl.split('.'))!.toLowerCase())) {
      showToast({ content: '不支持此格式的图片' })
      return
    }

    const fm = getFileSystemManager()
    const fileInfo: any = await new Promise(
      (resolve, reject) =>
        void fm.getFileInfo({
          filePath: tempAvatarUrl,
          success: resolve,
          fail: reject,
        })
    )

    if (fileInfo.size > 5 * 1024 * 1024) {
      showToast({ content: '图片大小不能超过 5M' })
      return
    }

    showLoading({ title: '头像上传中...' })
    uploadAvatarApi(tempAvatarUrl)
      .then(fileUrl => {
        onChange(fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl)
        hideLoading()
      })
      .catch(() => {
        hideLoading()
        showToast({ content: '头像上传失败，请稍后重试' })
      })
  }

  // 从相机或相册选取图片
  const chooseAvatarHandler = (source: 'camera' | 'album') => () => {
    chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: [source],
    })
      .then(imageInfo => {
        const file = imageInfo.tempFiles[0]

        if (file.size > 5 * 1024 * 1024) {
          showToast({ content: '图片大小不能超过 5M' })
          return
        } else if (
          !ALLOW_AVATAR_FILE_TYPE.includes(last(file.tempFilePath.split('.'))!.toLowerCase())
        ) {
          showToast({ content: '不支持此格式的图片' })
          return
        }

        showLoading({ title: '头像上传中...' })
        uploadAvatarApi(file.tempFilePath)
          .then(fileUrl => {
            onChange(fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl)
            hideLoading()
            setIsShowMask(false)
            setModal(false)
          })
          .catch(() => {
            hideLoading()
            showToast({ content: '头像上传失败' })
          })
      })
      .catch(noop)
  }

  return (
    <View className={c('avatar-uploader', className)} style={style}>
      <View className="avatar-uploader__title">
        <Text className="avatar-uploader__title-text">头像</Text>
        <Button
          openType="chooseAvatar"
          // @ts-ignore
          onChooseAvatar={newChooseAvatarHandler}
          className="avatar-uploader__title-button"
        >
          一键获取微信头像
        </Button>
      </View>
      <View className="avatar-uploader__tips">招聘方更喜欢真实头像的简历</View>

      <Button
        openType="chooseAvatar"
        // @ts-ignore
        onChooseAvatar={newChooseAvatarHandler}
        className="avatar-uploader__avatar"
      >
        <Image className="avatar-uploader__avatar__image" src={displayImage} mode="aspectFit" />
        {isShowMask ? (
          <View className="avatar-uploader__avatar__mask">
            <Image
              className="avatar-uploader__avatar__mask-icon"
              src={uploadIcon}
              mode="aspectFill"
            />
            <View className="avatar-uploader__avatar__mask-tips">上传头像</View>
          </View>
        ) : null}
      </Button>

      {alive ? (
        <View className={c('avatar-uploader__mask', active ? 'show' : 'hide')} catchMove>
          <View className={c('avatar-uploader__modal', active ? 'show' : 'hide')}>
            <View
              onClick={() => void setModal(false)}
              className="avatar-uploader__modal__close at-icon at-icon-close"
            ></View>

            <View className="avatar-uploader__modal__title">正确示例</View>
            <View className="avatar-uploader__modal__tips">上传真实头像，更容易获得青睐</View>
            <Image
              className="avatar-uploader__modal__example"
              src={exampleAvatar}
              mode="aspectFill"
            />

            <View className="avatar-uploader__modal__title">错误示例</View>
            <Image className="avatar-uploader__modal__wrong" src={wrongAvatar} mode="heightFix" />

            <View className="avatar-uploader__modal__action">
              <View
                onClick={chooseAvatarHandler('camera')}
                className="avatar-uploader__modal__button"
                hoverClass="hover"
              >
                拍照
              </View>
              <View
                onClick={chooseAvatarHandler('album')}
                className="avatar-uploader__modal__button"
                hoverClass="hover"
              >
                从手机相册选择
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  )
}

export default AvatarUploader
