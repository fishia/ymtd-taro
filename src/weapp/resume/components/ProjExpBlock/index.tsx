import React from 'react'
import _ from 'lodash'
import { View } from '@tarojs/components'

import { IProjectExp } from '@/def/resume'
import createResumeData from '../ResumeData'
import ResumeBlock, {
  ResumeExpList,
  ResumeExpListItem,
  ResumeHeader,
  ResumeRow,
} from '../ResumeBlock'

import './index.scss'
import { renderDate } from '../Form/utils'

const { ResumeData: Data, ResumeField: Field } = createResumeData<IProjectExp>()

export interface IProjExpBlockProps {
  projsInfo?: IProjectExp[]
  onEditClick?(clickedEl: IProjectExp | null, index: number): void
}

const ProjExpBlock: React.FC<IProjExpBlockProps> = props => {
  const { projsInfo = [], onEditClick = _.noop } = props

  const isNoExp = projsInfo.length <= 0

  const addprojexp = () => void onEditClick(null, -1)

  const Empty = () => (
    <View onClick={addprojexp} className="projexp-block__empty">
      添加项目经历，提升面试几率
    </View>
  )

  const Content = () => (
    <ResumeExpList>
      {projsInfo.map((projExp: IProjectExp, index) => (
        <ResumeExpListItem
          key={projExp.id || index}
          onEditClick={() => {
            onEditClick(projExp, index)
          }}
        >
          <Data
            data={projExp}
            onFieldClick={() => {
              onEditClick(projExp, index)
            }}
          >
            <ResumeHeader
              title={projExp.name}
              extra={renderDate(projExp)}
              hint
              elem={<Field field="name" label="项目名称" maxWidth={350} />}
            />

            {projExp.workDesc ? (
              <ResumeRow>
                <Field field="workDesc" label="工作描述" className="projexp-block__desc" />
              </ResumeRow>
            ) : null}
          </Data>
        </ResumeExpListItem>
      ))}
    </ResumeExpList>
  )

  return (
    <ResumeBlock className="projexp-block" onIconClick={addprojexp} title="项目经历">
      {isNoExp ? <Empty /> : <Content />}
    </ResumeBlock>
  )
}

export default ProjExpBlock
