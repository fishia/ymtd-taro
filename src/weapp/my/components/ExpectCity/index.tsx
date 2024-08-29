import c from 'classnames'
import _ from 'lodash'
import React from 'react'
import { AtListItem } from 'taro-ui'

import { ILocation, IProps } from '@/def/common'
import useSelectLocation from '@/hooks/custom/useSelectLocation'

import './index.scss'

export interface IExpectCityProps extends IProps {
  value?: ILocation[]
  onChange?(newLocations: ILocation[]): void
}

const ExpectCity: React.FC<IExpectCityProps> = props => {
  const { value = [], onChange = _.noop, className, style } = props

  const selectLocation = useSelectLocation()

  const hasLocations = value.length > 0
  const locationNames = value.map(item => item.name).join('，')

  const pickerClickHandler = () => {
    selectLocation<ILocation[]>(onChange, {
      mulitMode: true,
      required: true,
      selectionId: value.map(t => t.id as number),
    })
  }

  return (
    <AtListItem
      onClick={pickerClickHandler}
      title="期望城市"
      className={c(
        'form__multiple-location-picker form__multiple-location-picker--required',
        { 'form__multiple-location-picker--placeholder': !hasLocations },
        className
      )}
      customStyle={style}
      extraText={hasLocations ? locationNames : '请选择'}
      arrow="right"
    />
  )
}

export default ExpectCity
