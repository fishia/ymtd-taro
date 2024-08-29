import { View } from '@tarojs/components'
import _ from 'lodash'
import React from 'react'

import { IJobExp } from '@/def/resume'

import { renderDate } from '../Form/utils'
import ResumeBlock, {
  ResumeExpList,
  ResumeExpListItem,
  ResumeHeader,
  ResumeRow,
} from '../ResumeBlock'
import createResumeData from '../ResumeData'

import './index.scss'

const { ResumeData, ResumeField } = createResumeData<IJobExp>()

export interface IJobExpBlockProps {
  jobsInfo?: IJobExp[]
  onEditClick?(clickedEl: IJobExp | null, index: number): void
  isStudent?: boolean
}

const JobExpBlock: React.FC<IJobExpBlockProps> = props => {
  const { jobsInfo = [], isStudent, onEditClick = _.noop } = props
  const isNoExp = jobsInfo.length <= 0

  const addjobexp = () => void onEditClick(null, -1)

  const Empty = () => (
    <View onClick={addjobexp} className="jobexp-block__empty">
      添加工作经历，提升面试几率
    </View>
  )

  const Content = () => (
    <ResumeExpList>
      {jobsInfo.map((jobExp: IJobExp, index) => (
        <ResumeExpListItem
          key={jobExp.id || index}
          onEditClick={() => {
            onEditClick(jobExp, index)
          }}
        >
          <ResumeData
            data={jobExp}
            onFieldClick={() => {
              onEditClick(jobExp, index)
            }}
          >
            <ResumeHeader
              title={jobExp.company}
              extra={renderDate(jobExp)}
              elem={<ResumeField field="company" label="公司名称" maxWidth={350} />}
              hint
            />

            <ResumeRow>
              <ResumeField field="position" label="职位名称" maxWidth={300} />
              <ResumeField
                field="functionTypeName"
                maxWidth={380}
                label="职位类别"
                beforeSeparator
              />
            </ResumeRow>

            {(jobExp.keywords || []).length > 0 ? (
              jobExp.keywords.map((keyword, idx) => (
                <View key={idx} className="jobexp-block__tag">
                  {keyword.name}
                </View>
              ))
            ) : (
              <ResumeRow>
                <ResumeField field="keywords" label="职位关键词" array noHint/>
              </ResumeRow>
            )}

            <ResumeRow>
              <ResumeField field="workDesc" label="描述" noHint className="jobexp-block__desc" />
            </ResumeRow>
          </ResumeData>
        </ResumeExpListItem>
      ))}
    </ResumeExpList>
  )

  return (
    <ResumeBlock
      className="jobexp-block"
      onIconClick={addjobexp}
      title="工作经历"
      required={!isStudent}
    >
      {isNoExp ? <Empty /> : <Content />}
    </ResumeBlock>
  )
}

export default JobExpBlock
