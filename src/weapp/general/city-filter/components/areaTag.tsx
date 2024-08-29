import { View } from '@tarojs/components'
import c from 'classnames'

import { ICityOption } from '@/def/common'

import './areaTag.scss'

export interface IAreaTagProps extends ICityOption {
  selected?: boolean
  disabled?: boolean
  levelKey: string
  onClick: (levelKey: string, value?: number) => void
  onDisableClick?: () => void
}
const AreaTag: React.FC<IAreaTagProps> = props => {
  const { selected = false, name, onClick, onDisableClick, levelKey, id, disabled } = props

  const handleClick = () => {
    if (disabled) {
      onDisableClick && onDisableClick()
    } else {
      onClick(levelKey, id)
    }
  }
  return (
    <View
      className={c('cityFilter-index__menu__block', {
        'cityFilter-index__menu__block--selected': selected,
      })}
      onClick={handleClick}
    >
      {name}
    </View>
  )
}

export default AreaTag
