import React, { useCallback, useEffect, useState } from 'react'
import c from 'classnames'
import { ScrollView, View } from '@tarojs/components'
import {
  eventCenter,
  hideLoading,
  navigateBack,
  showLoading,
  useDidHide,
  useRouter,
} from '@tarojs/taro'

import { IJobCategory } from '@/def/common'
import { fetchJobCategoriesApi } from '@/apis/job-categories'
import { SelectJobCategoryEventName } from '@/hooks/custom/useSelectJobCategory'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import Button from '@/components/Button'
import JobCategoryButton from './components/JobCategoryButton'

import './index.scss'

const JobCategories: React.FC = () => {
  const showToast = useToast()
  const router = useRouter()
  const isMulitMode = router.params.mulitMode
  const limit = Number(router.params.limit) || 5
  const defaultSelection = router.params.selection || ''
  const isRequired = router.params.required

  const [selections, setSelections] = useState<IJobCategory[]>([])
  const [currentJobMajorCategory, setCurrentJobMajorCategory] = useState<IJobCategory>()

  const [jobMajorCategories, setJobMajorCategories] = useState<IJobCategory[]>([])
  const [jobMajorCount, setJobMajorCount] = useState<Optional<Record<string, number>>>({})

  const isEnableConfirm = isMulitMode && isRequired ? selections.length > 0 : true

  useEffect(() => {
    showLoading({ title: '加载中...' })
    fetchJobCategoriesApi()
      .then(jobs => {
        setJobMajorCategories(jobs)
        setCurrentJobMajorCategory(jobs[0])

        // 处理默认已选中元素的情况
        if (isMulitMode && defaultSelection) {
          const selectedIds = defaultSelection.split(',').filter(Boolean).map(String)

          const count: Optional<Record<string, number>> = {}
          const selection: IJobCategory[] = []

          for (const majorJob of jobs) {
            for (const blockJob of majorJob.options || []) {
              for (const singleJob of blockJob.options || []) {
                if (selectedIds.includes(singleJob.value)) {
                  count[majorJob.value] = (count[majorJob.value] || 0) + 1
                  selection.push(singleJob)
                }
              }
            }
          }

          setJobMajorCount(count)
          setSelections(selection)
        }

        hideLoading()
      })
      .catch(hideLoading)
  }, [defaultSelection, isMulitMode])

  useDidHide(() => {
    eventCenter.off(SelectJobCategoryEventName)
  })

  const isJobSelected = useCallback(
    (job: IJobCategory) => selections.map(t => t.value).includes(job.value),
    [selections]
  )

  const handleJobCategoryClick = (singleJobCategory: IJobCategory, majorId: string) => {
    if (!isMulitMode) {
      eventCenter.trigger(SelectJobCategoryEventName, singleJobCategory)
      navigateBack()

      return
    }

    if (isJobSelected(singleJobCategory)) {
      setJobMajorCount({ ...jobMajorCount, [majorId]: (jobMajorCount[majorId] || 1) - 1 })
      setSelections(selections.filter(t => t.value !== singleJobCategory.value))
    } else {
      if (selections.length >= limit) {
        showToast({ content: `最多支持选择 ${limit} 个` })

        return
      }
      setJobMajorCount({ ...jobMajorCount, [majorId]: (jobMajorCount[majorId] || 0) + 1 })
      setSelections([...selections, singleJobCategory])
    }
  }

  const handleConfirm = () => {
    if (isEnableConfirm) {
      eventCenter.trigger(SelectJobCategoryEventName, selections)
      navigateBack()
    }
  }

  return (
    <MainLayout className="job-categories">
      <ScrollView
        className={c('job-categories__sidebar', { 'job-categories__sidebar--multi': isMulitMode })}
        scrollY
      >
        {jobMajorCategories.map(majorCategory => (
          <View
            onClick={() => void setCurrentJobMajorCategory(majorCategory)}
            className={c('job-categories__major', {
              'job-categories__major--selected': currentJobMajorCategory === majorCategory,
            })}
            key={majorCategory.id}
          >
            {majorCategory.label}
            {(jobMajorCount[majorCategory.value] || 0) > 0 ? (
              <View className="job-categories__major__count">
                {jobMajorCount[majorCategory.value]}
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <ScrollView
        className={c('job-categories__group', { 'job-categories__group--multi': isMulitMode })}
        scrollY
      >
        {(currentJobMajorCategory?.options || []).map(blockCategory => (
          <View className="job-categories__block" key={blockCategory.id}>
            <View className="job-categories__block__title">{blockCategory.label}</View>
            <View className="job-categories__block__content">
              {(blockCategory.options || []).map(singleJobCategory => (
                <JobCategoryButton
                  onClick={() =>
                    void handleJobCategoryClick(singleJobCategory, currentJobMajorCategory!.value)
                  }
                  selected={isJobSelected(singleJobCategory)}
                  key={singleJobCategory.id}
                >
                  {singleJobCategory.label}
                </JobCategoryButton>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {isMulitMode ? (
        <View className="job-categories__multi-bar">
          <View className="job-categories__multi-bar__tip">
            <View className="icon iconfont icongouxuan"></View>
            已选 {selections.length}/{limit}
          </View>
          <Button
            onClick={handleConfirm}
            btnType={isEnableConfirm ? 'primary' : 'disabled'}
            className="job-categories__multi-bar__confirm"
          >
            确 定
          </Button>
        </View>
      ) : null}
    </MainLayout>
  )
}

export default JobCategories
