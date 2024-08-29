import { View } from '@tarojs/components'

import './index.scss'

const Line: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  return <View className="hd-line--large" style={style} />
}

export default Line
