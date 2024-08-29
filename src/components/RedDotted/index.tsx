import { View } from '@tarojs/components'
import c from 'classnames'

const RedDotted: React.FC<{ visible?: boolean }> = props => (
  <View className={c(props.visible ? 'dotted' : 'dis-n')}></View>
)

export default RedDotted
