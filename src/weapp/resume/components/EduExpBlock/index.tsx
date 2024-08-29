import { View } from '@tarojs/components'
import _ from 'lodash'
import React from 'react'

import { IEducationExp } from '@/def/resume'
import { useResumeOptions } from '@/services/ResumeService'

import { renderYearDate } from '../Form/utils'
import ResumeBlock, {
  ResumeExpList,
  ResumeExpListItem,
  ResumeHeader,
  ResumeRow,
} from '../ResumeBlock'
import createResumeData from '../ResumeData'

import './index.scss'

const { ResumeData, ResumeField } = createResumeData<IEducationExp>()

export interface IEduExpBlockProps {
  edusInfo?: IEducationExp[]
  onEditClick?(clickedEl: IEducationExp | null, index: number): void
  isStudent?: boolean
}

const EduExpBlock: React.FC<IEduExpBlockProps> = props => {
  const { edusInfo = [], onEditClick = _.noop, isStudent } = props
  const resumeOptions = useResumeOptions()

  const isNoExp = edusInfo.length <= 0

  const addEduExp = () => void onEditClick(null, -1)

  const Empty = () => (
    <View onClick={addEduExp} className="eduexp-block__empty">
      请添加教育经历
    </View>
  )

  const Content = () => (
    <ResumeExpList>
      {edusInfo.map((eduExp: IEducationExp, index) => (
        <ResumeExpListItem
          onEditClick={() => {
            onEditClick(eduExp, index)
          }}
          key={eduExp.id || index}
        >
          <ResumeData
            data={eduExp}
            onFieldClick={() => {
              onEditClick(eduExp, index)
            }}
          >
            <ResumeHeader
              title={eduExp.school}
              extra={renderYearDate(eduExp)}
              hint
              elem={
                Number(eduExp.education || 0) >= 3 ? (
                  <ResumeField
                    field="school"
                    label="学校名称"
                    maxWidth={350}
                    noHint={Number(eduExp.education || 0) === 3}
                  />
                ) : (
                  <ResumeField
                    field="education"
                    label="学校名称"
                    option={resumeOptions.education}
                    noHint
                  />
                )
              }
            />
            {Number(eduExp.education || 0) >= 3 ? (
              <ResumeRow>
                <ResumeField field="education" label="学历" option={resumeOptions.education} />

                <ResumeField
                  field="major"
                  label="专业"
                  maxWidth={Boolean(eduExp.education) ? 450 : 380}
                  beforeSeparator
                  noHint={Number(eduExp.education || 0) === 3}
                />
              </ResumeRow>
            ) : null}
            {isStudent && Number(eduExp.education || 0) >= 4 ? (
              <ResumeRow>
                <ResumeField
                  field="schoolExperience"
                  label="校园经历"
                  className="projexp-block__desc"
                />
              </ResumeRow>
            ) : null}
          </ResumeData>
        </ResumeExpListItem>
      ))}
    </ResumeExpList>
  )

  return (
    <ResumeBlock className="eduexp-block" onIconClick={addEduExp} required title="教育经历">
      {isNoExp ? <Empty /> : <Content />}
    </ResumeBlock>
  )
}

export default EduExpBlock
