import { navigateTo, chooseMessageFile } from '@tarojs/taro'
import { last, noop } from 'lodash'

import { fetchUploadResumeResultApi, uploadResumeByWxDocApi } from '@/apis/resume'
import { ALLOW_RESUME_FILE_TYPE } from '@/config'
import { IResume } from '@/def/resume'
import { usePreviewResume } from '@/hooks/custom/useResumePreview'
import useShowLoadingStatus from '@/hooks/custom/useShowLoadingStatus'
import useToast from '@/hooks/custom/useToast'
import { polling } from '@/services/NetworkService'
import { ensureResumeOptions } from '@/services/ResumeService'
import { encodeURLParams } from '@/services/StringService'
import { sendHongBaoEvent } from '@/utils/dataRangers'

export function useUploadResumeByWx(jobId?: string) {
  const showToast = useToast()
  const { showLoadingStatus, hideLoadingStatus } = useShowLoadingStatus()
  const [, setPreviewResume] = usePreviewResume()

  return async () => {
    try {
      const create_path_name = '微信文件导入'
      sendHongBaoEvent('CVCreateSelect', {
        page_name: '简历创建方式页',
        way_name: create_path_name,
      })

      const chooseFileResult = await chooseMessageFile({ count: 1 }).catch(noop)

      const fileInfo = chooseFileResult?.tempFiles?.[0]
      if (!fileInfo) {
        return
      } else if (fileInfo.size > 20 * 1024 * 1024) {
        showToast({ content: '文件过大，请选择20M以内的文件' })
        return
      } else if (!ALLOW_RESUME_FILE_TYPE.includes(last(fileInfo.path.split('.'))!.toLowerCase())) {
        showToast({ content: '文件格式错误，请选择 word/pdf/jpg/jpeg/png 格式' })
        return
      }

      showLoadingStatus({ hasNavBar: true, loadingText: '文件上传中...' })
      const fileKey = await uploadResumeByWxDocApi(fileInfo.path, fileInfo.name)
      const resume = await polling<IResume>(
        () => fetchUploadResumeResultApi(fileKey),
        Boolean
      ).then(ensureResumeOptions)
      setPreviewResume(resume)
      hideLoadingStatus()

      navigateTo({
        url:
          '/weapp/resume/complete-resume/index?' +
          encodeURLParams({ mode: 'confirm', way_name: '微信文件导入', jobId }),
      })
    } catch {
      showToast({ content: '文件导入失败，请重试' })
    }
  }
}
