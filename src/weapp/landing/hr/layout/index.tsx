import { View, Image } from '@tarojs/components'
import { FC, useEffect, useRef, useState } from 'react'
import Advertise from '../../components/Advertise'

import Login from './Login'
import c from 'classnames'
import './index.scss'
import './font.css'
import { createSelectorQuery, nextTick, usePageScroll } from '@tarojs/taro'
import Slogan from '../../components/Slogan'
import Viewpager from '../../components/ViewPager'
import { companyData, ICompany, IJob, jobData, randomAvatar } from './data'
import JobCard from '../../components/JobCard'
import CompanyCard from '../../components/CompanyCard'
import freeIcon from '@/assets/imgs/free.svg'
import starIcon from '@/assets/imgs/star.svg'
import chatIcon from '@/assets/imgs/chat.svg'
import useChannel from './useChannel'
import MainLayout from '@/layout/MainLayout'

export type TSeal = {
  isSeal?: boolean
}

const HRLanding: FC<TSeal> = props => {
  const { isSeal = false } = props
  const prefixCls = 'landing-hr'

  const distanceRef = useRef(0)

  const reportStore = useChannel()

  const [fixed, setFixed] = useState(false)

  useEffect(() => {
    nextTick(() => {
      const query = createSelectorQuery()

      query.select(`.${prefixCls}__login`).boundingClientRect()

      query.exec(res => {
        distanceRef.current = res[0].height + res[0].top
      })
    })
  }, [])

  usePageScroll(res => {
    if (!fixed && distanceRef.current && res.scrollTop >= distanceRef.current) {
      setFixed(true)
    } else if (fixed && res.scrollTop < distanceRef.current) {
      setFixed(false)
    }
  })

  const renderJob = () => {
    const handler = (data: IJob, idx: number) => {
      if (isSeal) {
        data.logo = randomAvatar(data.name)
      }
      return <JobCard key={idx} {...data} />
    }
    return (
      <>
        <Slogan
          className={`${prefixCls}__slogan--candidate`}
          title="海量精准"
          subTitle="大健康候选人在线活跃"
        />
        <Viewpager
          className={`${prefixCls}__swiper--job`}
          data={jobData}
          pageSize={2}
          renderHandler={handler}
        />
      </>
    )
  }
  const renderCompany = () => {
    const handler = (data: ICompany, idx: number) => {
      if (isSeal) {
        data.name = data.anonymousName || '某全球制药巨头'
        data.logo = require('@/assets/imgs/flatLogo.svg')
      }
      return <CompanyCard key={idx} {...data} />
    }
    return (
      <>
        <Slogan
          className={`${prefixCls}__slogan--hr`}
          title="12000+"
          subTitle="大健康企业HR发布高薪职位"
        />
        <Viewpager
          className={`${prefixCls}__swiper--company`}
          data={companyData}
          pageSize={3}
          renderHandler={handler}
        />
      </>
    )
  }
  return (
    <MainLayout>
      <View className={c(prefixCls, { [`${prefixCls}--fixed`]: fixed })}>
        <View className={`${prefixCls}__header`}>
          <View className={`${prefixCls}__header-bg`}></View>
          {/* <Advertise>
            <View className={`${prefixCls}__slogan-item `}>
              免费招聘
              <Image className={`${prefixCls}__slogan-icon`} src={freeIcon} />
            </View>
            <View className={`${prefixCls}__slogan-item `}>
              智能推荐
              <Image className={`${prefixCls}__slogan-icon`} src={starIcon} />
            </View>
            <View className={`${prefixCls}__slogan-item `}>
              在线沟通
              <Image className={`${prefixCls}__slogan-icon`} src={chatIcon} />
            </View>
          </Advertise> */}
          <Login className={`${prefixCls}__login`} fixed={fixed} />
        </View>
        {renderJob()}
        {renderCompany()}
      </View>
    </MainLayout>
  )
}

export default HRLanding
