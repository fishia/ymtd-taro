import { IResumeOptions } from '@/def/resume'

let resumeOptions: Nullable<IResumeOptions> = null

export function getResumeOptions(): Nullable<IResumeOptions> {
  return resumeOptions
}

export function setResumeOptions(newResumeOptions: IResumeOptions) {
  resumeOptions = newResumeOptions
}
