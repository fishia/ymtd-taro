import React from 'react'
import _ from 'lodash'

import { IJob, JobTemplateType } from '@/def/job'
import DefaultTemplate from './DefaultTemplate'
import MedicalRepresentativeTemplate from './MedicalRepresentativeTemplate'
import CommonTemplate from './CommonTemplate'

export interface IJobDetailsTemplateProps<T extends IJob = IJob> {
  jobInfo: T
  afterLoaded?(): void
}

export const JobTemplateMap: Record<JobTemplateType, React.FC<IJobDetailsTemplateProps>> = {
  [JobTemplateType.DEFAULT_TEMPLATE]: DefaultTemplate,
  [JobTemplateType.MEDICAL_REPRESENTATIVE]: MedicalRepresentativeTemplate,
  [JobTemplateType.COMMON_TEMPLATE]: CommonTemplate,
}

const JobDetailsTemplate: React.FC<Optional<IJobDetailsTemplateProps>> = props => {
  if (!props.jobInfo) {
    return null
  }

  const Template = JobTemplateMap[props.jobInfo.template_type || JobTemplateType.DEFAULT_TEMPLATE]

  return <Template jobInfo={props.jobInfo || {}} afterLoaded={props.afterLoaded || _.noop} />
}

export default JobDetailsTemplate
