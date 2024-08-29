import { View } from '@tarojs/components'
import { navigateBack, getMenuButtonBoundingClientRect, getSystemInfoSync } from '@tarojs/taro'
import c from 'classnames'
import R from 'ramda'

import { IProps } from '@/def/common'
import { mpcFunctionTag } from '@/def/job'

import './index.scss'

const systemInfo = getSystemInfoSync()
const statusBarHeight = (systemInfo?.statusBarHeight || 20) + 5
const capsuleRect = getMenuButtonBoundingClientRect()
export const topNavHeight = capsuleRect?.height + statusBarHeight

export interface IZonesNavigation extends IProps {
  functionType?: number | string
  title: string
  tabList?: Array<mpcFunctionTag>
  onChange?: (id: number) => void
}

const ZonesNavigation: React.FC<IZonesNavigation> = props => {
  const { title, tabList = [], className, functionType, onChange = R.T } = props
  return (
    <View
      className={c('zones-navigation', className, { hasBg: false })}
      style={{ paddingTop: `${statusBarHeight}px` }}
    >
      <View
        className={c('zones-navigation__title', { whiteTitle: false })}
        style={{
          lineHeight: `${capsuleRect?.height}px`,
        }}
      >
        <View onClick={() => navigateBack()} className="zones-navigation__icon">
          <View className="zones-navigation__back at-icon at-icon-chevron-left"></View>
        </View>
        {title}
      </View>
      {tabList.length ? (
        <View className="zones-navigation__tabs">
          {tabList.map((item, i) => (
            <View
              className={c('zones-navigation__tabItem', {
                'tabItem--active': item.functionType === functionType,
              })}
              key={i}
              onClick={() => onChange(item.functionType)}
            >
              {item.functionName}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

export default ZonesNavigation
