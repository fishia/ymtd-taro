import React from 'react'

import { STATIC_MP_IMAGE_HOST } from '@/config'
import Empty from '@/components/Empty'

import './index.scss'

const NoJob: React.FC = () => (
  <Empty
    picUrl={STATIC_MP_IMAGE_HOST + 'no-job.png'}
    className="job-index__no-job"
    text="没有符合条件的职位记录"
  />
)

export default NoJob
