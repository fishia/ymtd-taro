import { View, Image } from '@tarojs/components'
import c from 'classnames'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'

import arrowIcon from '@/assets/imgs/cell-arrow.png'
import { ILocation, IProps } from '@/def/common'
import useSelectLocation from '@/hooks/custom/useSelectLocation'

import { IFormComponentProps } from '../Form'

import './index.scss'

export interface ILocationPickerProps extends IFormComponentProps<number>, IProps {
  placeholder?: string
  name?: string
  onChangeLocation?(val: ILocation): void
}

const LocationPicker: React.FC<ILocationPickerProps> = props => {
  const {
    className,
    style,
    title,
    value = 0,
    name = '(未知)',
    placeholder,
    error = false,
    onChange = _.noop,
    onFocus = _.noop,
    onChangeLocation = _.noop,
  } = props

  const [locationId, setLocationId] = useState<number>()
  const [locationName, setLocationName] = useState<string>()

  useEffect(() => void setLocationId(value), [value])
  useEffect(() => void setLocationName(name), [name])

  const selectLocation = useSelectLocation()

  const pickerClickHandler = () => {
    onFocus()
    selectLocation(
      newLocation => {
        setLocationId(newLocation.id)
        setLocationName(newLocation.name)

        onChange(newLocation.id)
        onChangeLocation(newLocation)
      },
      { showAll: true, selectionId: value ? [value] : [] }
    )
  }

  const hasLocation = Number(locationId) > 0

  return (
    <View
      className={c('form__location-picker', className, error ? 'form__location-picker--error' : '')}
      style={style}
      hoverClass="hover"
      onClick={pickerClickHandler}
    >
      <View className="form__location-picker__title">{title}</View>
      <View className="form__location-picker__content">
        <View
          className={c(
            'form__location-picker__text',
            !hasLocation ? 'form__location-picker__placeholder' : ''
          )}
        >
          {hasLocation ? locationName : placeholder}
        </View>
        <Image className="form__location-picker__arrow" src={arrowIcon} mode="aspectFill" />
      </View>
    </View>
  )
}

export default LocationPicker
