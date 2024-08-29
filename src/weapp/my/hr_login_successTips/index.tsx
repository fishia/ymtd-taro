import { View, Image, Text } from '@tarojs/components'
import './index.scss'
import { makePhoneCall, navigateBack, useRouter } from '@tarojs/taro'
import { YMTD_PHONE } from '@/config'
import { useEffect } from 'react'

const Login: React.FC = () => {

  const router = useRouter()
  const account = router.params.account && String(router.params.account)
  const password = router.params.password && String(router.params.password)
  useEffect(
    () => {
      return () => {
        navigateBack({ delta: 2 })
      };
    },
    [],
  );
  return (
    <View className="login_successTips-index">
      <Image src={require('./register-tips.png')} mode="aspectFill" className="login_successTips-index__icon" />
      <View className="login_successTips-index__tips">
        <View className="login_successTips-index__text">亲爱的用户，您好！ </View>
        <View className="login_successTips-index__text">
          恭喜您，已成功注册账号。使用电脑打开
          <Text className="login_successTips-index__link">hr.yimaitongdao.com</Text>
          ，即可开启招聘之旅!
        </View>
        <View className="login_successTips-index__text">您的账号:{account}</View>
        <View className="login_successTips-index__text">初始密码:{password} (请及时更改初始密码) </View>
      </View>
      <View className="login_successTips-index__bottom">如有其他问题，请联系
        <Text className="login_successTips-index__link" onClick={() => {
          makePhoneCall({
            phoneNumber: YMTD_PHONE
          })
        }}
        >
          {YMTD_PHONE}
        </Text>
      </View>
    </View>
  )
}

export default Login
