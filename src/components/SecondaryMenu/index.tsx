import { ScrollView, View } from '@tarojs/components'
import cls from 'classnames'
import { noop } from 'lodash'
import { FC, useEffect, useState } from 'react'

import { IJobCategory, IProps } from '@/def/common'

import './index.scss'

const prefixCls = 'career-secondaryMenu'

export interface ISecondaryMenu extends IProps {
  data: IJobCategory[]
  selected?: string[]
  onMenuClick?(v: IJobCategory): void | IJobCategory[]
  onChoose(v: IJobCategory): void
}

/**
 * 二级选择菜单
 * 暂不支持多选，不支持右栏自定义渲染
 * 之后补emmm
 * @param props
 * @returns
 */
export default function SecondaryMenu(props: ISecondaryMenu): ReturnType<FC<ISecondaryMenu>> {
  const { className, style, data = [], onMenuClick = noop, onChoose, selected } = props
  const [dataSource, setDataSource] = useState(() => data)

  const [scrollInto, setScrollInto] = useState<string>()

  useEffect(() => {
    setDataSource(data)
  }, [data])

  const [current, setCurrent] = useState<number>(0)

  useEffect(() => {
    if (selected) {
      for (let index = 0; index < data.length; index++) {
        const majorJob = data[index]
        for (const blockJob of majorJob.options || []) {
          for (const singleJob of blockJob.options || []) {
            if (selected.includes(singleJob.value)) {
              // count[majorJob.value] = (count[majorJob.value] || 0) + 1
              setCurrent(index)
              setScrollInto(`${prefixCls}__secondary-block__${blockJob.value}`)
              break
            }
          }
        }
      }
    }
  }, [data, selected])

  const menuHandler = (index: number) => {
    const choosed = dataSource[index]
    setCurrent(index)
    if (onMenuClick) {
      const secondaryData = onMenuClick(choosed)
      if (Array.isArray(secondaryData)) {
        choosed.options = secondaryData
        dataSource.splice(index, 1, { ...choosed })
        setDataSource([...dataSource])
      }
    }
  }

  const optionHandler = (choosed: IJobCategory) => {
    onChoose(choosed)
  }

  return (
    <View className={cls(prefixCls, className)} style={style}>
      <ScrollView className={`${prefixCls}__primary`} scrollY>
        {dataSource.map((pData, index) => (
          <View
            onClick={() => void menuHandler(index)}
            className={cls(`${prefixCls}__primary-item`, {
              [`${prefixCls}__primary-item--selected`]: current === index,
            })}
            key={index}
          >
            {pData.label}
            {/* {(jobMajorCount[majorCategory.value] || 0) > 0 ? (
              <View className="job-categories__major__count">
                {jobMajorCount[majorCategory.value]}
              </View>
            ) : null} */}
          </View>
        ))}
      </ScrollView>

      <ScrollView className={`${prefixCls}__secondary`} scrollIntoView={scrollInto} scrollY>
        {(dataSource[current]?.options || []).map((sData, index) => (
          <View
            className={`${prefixCls}__secondary-block`}
            id={`${prefixCls}__secondary-block__${sData.value}`}
            key={index}
          >
            <View className={`${prefixCls}__secondary-name`}>{sData.label}</View>
            <View className={`${prefixCls}__secondary-children`}>
              {(sData.options || []).map(option => (
                <View
                  className={cls(`${prefixCls}__secondary-button`, {
                    [`${prefixCls}__secondary-button--selected`]: (selected || []).includes(
                      option.value
                    ),
                  })}
                  onClick={() => void optionHandler(option)}
                  key={String(option.id)}
                >
                  {option.label}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
