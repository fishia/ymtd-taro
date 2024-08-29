export interface IResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

export interface IError extends IResponse<any> {
  success: false
  errorCode: number
  errorMessage: string
}

export interface IFormError<FormType> extends IError {
  errors: Partial<Record<keyof FormType, string[]>>
}

export declare type MethodType = 'GET' | 'PUT' | 'DELETE' | 'POST'

export interface IRequestOption {
  url: string
  method?: MethodType
  data?: { [key: string]: any }
  header?: { [key: string]: string | null }

  reportAddTags?: string[]
}

export interface IApiRequestOption extends IRequestOption {
  cacheKey?: string
  throttle?: number
}
