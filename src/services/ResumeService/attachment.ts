import { downloadFile, getFileSystemManager, openDocument, previewImage } from '@tarojs/taro'

import { handleStaticUrl } from '@/apis/client/handleRequestOption'
import appStore from '@/store'

export enum ResumeAttachmentType {
  WORD = 'word',
  PDF = 'pdf',
  IMAGE = 'image',
}

function getFileType(fileName: string): ResumeAttachmentType {
  let postfix = (fileName || '').match(/\.([^.]+)$/)?.[1] || ''
  postfix = postfix.toLowerCase()

  if (['doc', 'docx'].includes(postfix)) {
    return ResumeAttachmentType.WORD
  } else if (postfix === 'pdf') {
    return ResumeAttachmentType.PDF
  }

  return ResumeAttachmentType.IMAGE
}

export function previewCurrentResumeAttachment() {
  if (appStore.getState().user?.attProfileUrl) {
    previewResumeAttachment(
      appStore.getState().user?.attProfileUrl || '',
      appStore.getState().user?.attProfileName || ''
    )
  }
}

export async function previewResumeAttachment(fileUrl: string, fileName: string) {
  const fileType = getFileType(fileName)

  let previewUrl = fileUrl
  if (fileType === ResumeAttachmentType.IMAGE) {
    // 图片直接预览，wx.previewImage 支持网络图
    return void previewImage({ urls: [handleStaticUrl(previewUrl)] })
  }

  // Word、PDF 只能预览本地文件，因此 url 以 http 开头时需要先下载到本地
  previewUrl = await new Promise(res => {
    const downloadUrl = handleStaticUrl(fileUrl)

    downloadFile({
      url: downloadUrl,
      success: ({ tempFilePath }) => {
        let path = tempFilePath
        if (fileName) {
          const newPath = `${wx.env.USER_DATA_PATH}/${fileName}`
          try {
            getFileSystemManager().copyFileSync(path, newPath)
            path = newPath
          } catch {}
        }
        res(path)
      },
    })
  })

  openDocument({ filePath: previewUrl })
}
