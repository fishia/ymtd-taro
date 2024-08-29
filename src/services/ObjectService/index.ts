import R, { omit } from 'ramda'
import _ from 'lodash'
import { IPair } from '@/def/common'

interface IValue {
  value: number | string
  label: string
}

/**
 * 使用映射表来修改目标对象的键名，返回修改后的新对象
 * @param res 目标对象
 * @param keyNameMap 键名映射表，原始键名为 key，目标键名为 value
 * @returns 修改后的新对象
 */
export function mapKeys<T extends object, R extends object = object>(
  res: R,
  keyNameMap: Record<keyof R, keyof T>
): T {
  return _.mapKeys(res, (_1, key) => keyNameMap[key] || key) as T
}

/**
 * 将value label对象数组转换为id name对象数组
 * @param arr IValue[]
 * @returns arr IPair[]
 */
export const mapIValueToIPair = (arr: IValue[]): IPair[] => {
  if (!arr) return []
  const format = (obj: IValue): IPair => mapKeys(obj, { value: 'id', label: 'name' })
  return R.map(format, arr)
}

/**
 * 如果源对象存在值返回源对象，否则返回目标对象
 * @param objValue 目标对象
 * @param srcValue 源对象
 * @returns 非Undefined对象
 */
export const replaceNil = (objValue: any, srcValue: any) => {
  return _.isUndefined(srcValue) ? objValue : srcValue
}

/**
 * 合并两个对象的非空属性，从右往左
 * @param targetObject 目标对象
 * @param sourceObject 源对象
 * @returns 合并后的对象
 */
export const mergeValidProp = (targetObject: Object, sourceObject: Object) =>
  _.assignWith(targetObject, sourceObject, replaceNil)

export type FactoryOperationType = {
  from: string
  to: string
  method?: Func1<any, any>
}

/**
 * 将源对象加工成目标对象
 * @param res 源对象
 * @param operation 加工流程
 * @param isAutoTransfer 是否自动迁移未标明的属性
 * @returns 目标对象
 */
export function transformObjectWith<T extends object, R extends object = object>(
  source: T,
  operation: FactoryOperationType[],
  isAutoComplete: boolean
): R {
  let output = {} as R
  for (let op of operation) {
    if (source[op.from]) {
      {
        output[op.to] = op.method ? op.method(source[op.from]) : source[op.from]
      }
    }
  }

  return isAutoComplete
    ? ({
        ...output,
        ...omit(
          operation.map(v => v.from),
          source
        ),
      } as R)
    : output
}
