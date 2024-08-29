import { View } from '@tarojs/components'

import { IContactInfo } from '@/def/common'
import MainLayout from '@/layout/MainLayout'

import './index.scss'
import { useEffect, useState } from 'react'
import { fetchBizContactApi } from '@/apis/user'

const data = [
  {
    title: '关于我们',
    text:
      '医脉同道（微信公众号：yimaitongdao），领先的大健康招聘平台，海量人才、免费招聘、智能推荐、在线沟通，助力大健康企业高效获取人才。依托科锐国际25年大健康行业人力资源深度服务经验，通过精准的人才模型扫描与标签细分，应用“在线沟通”+“私域流量”模式，打磨真正适合大健康行业招聘者与求职者的产品。',
  },
  {
    title: '用户类型',
    text: '大健康行业从业人员，包括但不限于医药/医疗器械的研发、临床、生产制造、供应链、商业流通等全产业链人才，同时也包含医生、护士、医工等医疗服务领域人才。',
  },
  {
    title: '服务类型',
    text: '大健康行业的招聘者和求职者。',
  },
]
const defaultContect: IContactInfo = {
  name: '',
  phone: '',
  wx: '',
  email: '',
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <View className="cooperation-section__header">
      <View className="cooperation-section__title">{title}</View>
      <View className="cooperation-section__dot" />
      <View className="cooperation-section__dot dot--idx2" />
      <View className="cooperation-section__dot dot--idx3" />
    </View>
  )
}

const Contact: React.FC<{ icon: string; text?: string; color: string }> = ({
  icon,
  text,
  color,
}) => {
  return (
    <View className="my-cooperation__contact">
      <View className={`icon iconfont ${icon}`} style={{ color }} />
      {text}
    </View>
  )
}

const Logo = () => <View className="my-cooperation__logo"></View>

const Cooperation = () => {
  const [contact, setContact] = useState<IContactInfo>(defaultContect)

  useEffect(() => void fetchBizContactApi().then(setContact), [])

  return (
    <MainLayout navBarTitle="商务合作" className="my-cooperation">
      <Logo />
      {data.map((v, idx) => (
        <View className="my-cooperation__section" key={idx}>
          <SectionHeader title={v.title} />
          <View className="cooperation-section__text">{v.text}</View>
        </View>
      ))}
      <View className="my-cooperation__section" style={{ margin: '0 auto' }}>
        <SectionHeader title="联系方式" />
        <Contact icon="iconlianxiren" color="#009CFF" text={contact.name} />
        <Contact icon="icondianhua" color="#FFBF00" text={contact.phone} />
        <Contact icon="iconweixin2" color="#08BA06" text={contact.wx} />
        <Contact icon="iconyouxiang" color="#FF645E" text={contact.email} />
      </View>
    </MainLayout>
  )
}

export default Cooperation
