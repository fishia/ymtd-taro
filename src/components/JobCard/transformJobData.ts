import { IJob, JobTemplateType } from '@/def/job'

export function transformJobData(jobData: any): IJob {
  const hr = { ...jobData.hr }
  const company = { ...jobData.company }
  const address = { ...(jobData.address || [])[0] }

  hr.id = hr.hrId
  hr.company_name = company.name

  return {
    ...jobData,
    salary_type: jobData.salaryType === '12薪' ? '' : jobData.salaryType,
    template_type: JobTemplateType.COMMON_TEMPLATE,
    hr,
    company,
    address,
  }
}
