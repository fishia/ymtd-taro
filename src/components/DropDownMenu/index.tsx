import { ITouchEvent, View } from '@tarojs/components'
import _ from 'lodash'
import R from 'ramda'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import styles from '@/assets/colors'
import Button from '@/components/Button'
import ChooseButton, { IChooseEvent } from '@/components/ChooseButton'
import { IChoose, IPair, IProps } from '@/def/common'

import './index.scss'

export type OptionsType = {
  series: IPair & { multiLevel?: boolean }
  data: IChoose[]
}

interface IDropDownProps extends IProps {
  name?: string
  className?: string
  title: string
  isOpened?: boolean
  dataSource: OptionsType[]
  onConfirm: (choose: IChoose[], name?: string) => void
  onReset?: (name?: string) => void
  onClick?: (opened: boolean, name?: string) => void
}

const DropDownMenu: React.FC<IDropDownProps> = props => {
  const {
    name,
    title,
    dataSource,
    isOpened = false,
    onConfirm,
    onReset,
    onClick,
    className,
  } = props
  const [choosed, setChoosed] = useState<IChoose[]>([])
  const [opened, setOpened] = useState<boolean>(false)

  const titleWithNum = useMemo(() => {
    const len = choosed.length
    if (len === 0) {
      return title
    }
    if (len > 99) {
      return '${title}（99+）'
    }
    return `${title}（${len}）`
  }, [choosed, title])
  useEffect(() => {
    setOpened(isOpened)
  }, [isOpened])

  // 遍历筛选项
  let travelFn = cond => {
    for (let d of cond.data) {
      d.selected = false
      if (cond.series.multiLevel) {
        travelFn(d)
      } else {
        for (let c of choosed) {
          if (c.id === d.id && c.category?.id === cond.series.id) {
            d.selected = true
            break
          }
        }
      }
    }
  }

  // 初始化已选择项
  const initChoosed = useCallback(() => {
    const selected: IChoose[] = []
    let pushSelected = cond => {
      for (let d of cond.data) {
        if (cond.series.multiLevel) {
          pushSelected(d)
        } else {
          if (d.selected) {
            selected.push({ id: d.id, name: d.name, category: cond.series })
          }
        }
      }
    }
    for (let s of dataSource) {
      pushSelected(s)
    }
    setChoosed(selected)
  }, [setChoosed, dataSource])

  useEffect(() => {
    initChoosed()
  }, [opened, initChoosed])

  const handleClick = (event: ITouchEvent) => {
    event.stopPropagation()
    setOpened(!opened)
    // initChoosed()
    onClick && onClick(!opened, name)
  }

  const handleChoose = (event: IChooseEvent) => {
    const { selected, item, category } = event
    if (selected) {
      //如果是薪资或者经验，需要默认选择范围内的所有选项
      if (category && ['salary_scope', 'work_time'].indexOf(category?.id as string) > -1) {
        const categoryChoosed = choosed.filter(v => v.category?.id === category.id)
        const max = Math.max(item.id as number, ...categoryChoosed.map(v => v.id as number))
        const min = Math.min(item.id as number, ...categoryChoosed.map(v => v.id as number))
        const tempCategoryData = dataSource.filter(c => c.series.id === category.id)[0]?.data,
          tempChoose: IChoose[] = []
        for (let c of tempCategoryData) {
          let current_id = c.id as number
          if (min <= current_id && current_id <= max) {
            tempChoose.push({ ...c, category })
          }
        }
        setChoosed([...tempChoose, ...choosed])
      } else {
        setChoosed(R.append({ ...item, category }, choosed))
      }
    } else {
      if (category && ['salary_scope', 'work_time'].indexOf(category?.id as string) > -1) {
        setChoosed(
          choosed.filter(
            v =>
              (Number(v.id) < Number(item.id) && v.category?.id === category?.id) ||
              v.category?.id !== category?.id
          )
        )
      } else {
        setChoosed(values => {
          const idx = values.findIndex(v => v.id === item.id && v.category?.id === category?.id)
          values.splice(idx, 1)
          return [...values]
        })
      }
    }
  }

  // 修改dataSource,改变属性值
  const setDataSource = () => {
    for (let s of dataSource) {
      travelFn(s)
    }
  }

  // 确认搜索项，发起搜索
  const handleConfirm = (event: ITouchEvent) => {
    event.stopPropagation()
    setOpened(false)
    setDataSource()
    onConfirm(choosed, name)
  }

  // 重置选择项，但不重新发起搜索
  const handleReset = (event: ITouchEvent) => {
    event.stopPropagation()
    setChoosed([]) // 组件会重新渲染
    onReset && onReset(name)
  }

  const renderSeries = (series, data) => {
    return (
      <View>
        <View className="hd-dropdown__block-title">{series.name}</View>
        <View className="hd-dropdown__block-content">
          {series.multiLevel
            ? data.map((item, index) => (
                <View key={index} className="hd-dropdown__subCond">
                  {renderSeries(item.series, item.data)}
                </View>
              ))
            : data
                .sort((a, b) => Number(a.id) - Number(b.id))
                .map(v => {
                  return (
                    <ChooseButton
                      key={v.id}
                      item={v}
                      onClick={choose => handleChoose({ ...choose, category: series })}
                    />
                  )
                })}
        </View>
      </View>
    )
  }
  const renderDataSource = () => {
    // 重新渲染选择项

    const options = R.clone(dataSource)
    for (let s of options) {
      travelFn(s)
    }
    return options.map(({ series, data }, index) => {
      return (
        <View key={index} className="hd-dropdown__section">
          {renderSeries(series, data)}
        </View>
      )
    })
  }

  return (
    <>
      <View className={[className, 'hd-dropdown'].join(' ')}>
        <View className="hd-dropdown__head" onClick={handleClick}>
          <View
            className="hd-dropdown__text"
            style={{ color: choosed.length > 0 ? styles.primaryColor : '#484C64' }}
          >
            {titleWithNum}
          </View>
          <View className={`hd-dropdown__icon at-icon at-icon-chevron-${opened ? 'up' : 'down'}`} />
        </View>
        <View style={{ visibility: opened ? 'visible' : 'hidden' }}>
          <View className="hd-dropdown__content">{renderDataSource()}</View>
          <View className="hd-dropdown__section hd-dropdown__action">
            <Button className="dropdown-btn--reset" onClick={handleReset}>
              重置
            </Button>
            <Button className="dropdown-btn--confirm" btnType="primary" onClick={handleConfirm}>
              确定
            </Button>
          </View>
        </View>
      </View>
      {/* {opened && ( */}
      <View
        className={`hd-dropdown__overlay ${opened ? 'hd-dropdown__overlayShow' : ''}`}
        onClick={handleClick}
      />
      {/* )} */}
    </>
  )
}

export default DropDownMenu
