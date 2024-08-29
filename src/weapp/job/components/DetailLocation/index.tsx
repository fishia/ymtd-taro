import { View } from '@tarojs/components'
import { openLocation, navigateTo } from '@tarojs/taro'
import React, { useMemo } from 'react'

import { IAdress, IProps } from '@/def/common'

import './index.scss'

interface ILocationProps extends IProps {
  data: IAdress
  border?: boolean
  name?: string
}

const DetailLocation: React.FC<ILocationProps> = props => {
  const { data, border = true, className, style, name } = props
  const { city, address, province, lng, lat } = data
  const cityShow = useMemo(() => {
    let val = ''
    if (province) {
      val += province
    }
    if (city && !city.startsWith(province)) {
      val += city
    }
    return val
  }, [city, province])
  return (
    <>
      <View
        className={['detail-location', className].join(' ')}
        style={style}
        onClick={() => {
          if (lng && lat) {
            openLocation({
              latitude: lat,
              longitude: lng,
              address,
              name,
              scale: 10,
              success: () => {},
            })
          }
        }}
      >
        {/* <View className="icon iconfont icondingwei" /> */}
        <View className="detail-location__position">{`${cityShow}${address || ''}`}</View>
      </View>
      {border && <View className="detail-location__line" />}
    </>
  )
}

export default DetailLocation
