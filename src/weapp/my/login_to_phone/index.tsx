import { View } from '@tarojs/components'
import LoginForm from './components/loginForm'
import './index.scss'
import { useEffect } from 'react';

// const goExternal = () => {
//   navigateTo({ url: '/h5/landing/hr/index' })
// }

const Login: React.FC = () => {
  return (
    <View className="login-index">
      <LoginForm />
      {/* <View className="login-index__footer" onClick={goExternal}>
        我是HR , 我要招人
      </View> */}
    </View>
  )
}

export default Login
