import { Text, View } from '@tarojs/components'
import _ from 'lodash'
import React from 'react'

import { IResumeIntentInfo } from '@/def/resume'

import ResumeBlock, {
  ResumeExpList,
  ResumeExpListItem,
  ResumeHeader,
  ResumeRow,
} from '../ResumeBlock'
import createResumeData from '../ResumeData'

import './index.scss'

const { ResumeData, ResumeField } = createResumeData<IResumeIntentInfo>()

const renderSalary = (intentItem: IResumeIntentInfo) => {
  const { expectSalaryFrom, expectSalaryTo } = intentItem
  return expectSalaryFrom && expectSalaryTo ? `${expectSalaryFrom}-${expectSalaryTo}K` : ''
}

const renderKeywords = keywords => keywords.map(iten => iten.name).join('、')

export interface IIntentInfoBlockProps {
  intentInfo?: IResumeIntentInfo[]
  onEditClick?(clickedEl: IResumeIntentInfo | null, index: number): void
}

const IntentInfoBlock: React.FC<IIntentInfoBlockProps> = props => {
  const { intentInfo = [], onEditClick = _.noop } = props
  const isNoIntent = intentInfo.length <= 0

  const Empty = () => (
    <View onClick={() => void onEditClick(null, -1)} className="intent-block__empty">
      添加求职意向，精准推荐高薪职位
    </View>
  )
  const Content = () => (
    <ResumeExpList>
      {intentInfo.map((intentItem: IResumeIntentInfo, index) => (
        <ResumeExpListItem
          key={intentItem.id || index}
          onEditClick={() => void onEditClick(intentItem, index)}
          noLine
        >
          <ResumeData data={intentItem} onFieldClick={() => void onEditClick(intentItem, index)}>
            <ResumeHeader
              title={intentItem.expectPositionName}
              elem={
                <>
                  <ResumeField field="expectPositionName" label="期望职位" maxWidth={460} />
                  <Text className="salary">{renderSalary(intentItem)}</Text>
                </>
              }
              noExtraTips=""
              hint
            />

            <ResumeRow>
              <ResumeField field="cityName" label="期望城市" maxWidth={200} />
              <ResumeField
                field="keywords"
                maxWidth={450}
                label="关键词"
                render={renderKeywords}
                beforeSeparator
                noHint
              />
            </ResumeRow>
          </ResumeData>
        </ResumeExpListItem>
      ))}
    </ResumeExpList>
  )

  return (
    <ResumeBlock
      className="intent-block"
      icon={intentInfo?.length >= 3 ? null : 'icontianjia1'}
      onIconClick={() => void onEditClick(null, -1)}
      title="求职意向"
      required
    >
      {isNoIntent ? <Empty /> : <Content />}
    </ResumeBlock>
  )
}

export default IntentInfoBlock
