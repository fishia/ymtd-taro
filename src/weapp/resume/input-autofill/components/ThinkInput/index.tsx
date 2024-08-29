import { View, Input, BaseEventOrig, ITouchEvent, Form } from '@tarojs/components'
import { InputProps } from '@tarojs/components/types/Input'
import { useReady } from '@tarojs/taro'
import c from 'classnames'
import _ from 'lodash'
import React, { useCallback, useImperativeHandle, useMemo, useState } from 'react'

import ScrollView from '@/components/ScrollView'
import { APP_DEF_PAGE_SIZE } from '@/config'
import { IProps, IRelationalType, IList, IPair, LoadStatusType } from '@/def/common'
import useToast from '@/hooks/custom/useToast'
import { isValidString, textHighLight } from '@/services/StringService'

import './index.scss'

export interface IThinkInputProps extends IProps {
  searchValue?: string
  focus?: boolean
  onSearch?: (val: string, page?: number) => Promise<any[] | IList<IPair>>
  onConfrim?: (keyword: string, obj?: itemProps) => void
  onFocus?: () => void
  onClear?: () => void
  onInputClick?: () => void
  renderNoListTips?: () => void
  renderThinkItem?: (
    item: any,
    keyword: string,
    handleItemClick?: (e: ITouchEvent, data: itemProps) => any
  ) => React.ReactNode
  onPushNewValueApi?: (val: string) => Promise<boolean>
  onRightButtonClick?(keyword: string): void
  onSearchResultClick?(keyword: string, obj?: itemProps): void
  maxLength?: number
  showBadge?: boolean //列表是否展示标签
  rightBtnText?: string
  showRightBtn?: boolean
  placeholder?: string
  pagination?: boolean //是否分页
  blurEnable?: boolean
  isShowIcon?: boolean //是否展示搜索icon
  defaultFocus?: boolean
}

export interface itemProps {
  type?: IRelationalType
  id?: string
  name: string
  companyFullName?: string
}

const ThinkInput = (props: IThinkInputProps, ref) => {
  useImperativeHandle(ref, () => ({ value, setValue, setIsConfirmed, setFocus, items, setItems }))

  const {
    className,
    onSearch,
    onConfrim,
    onFocus,
    onClear,
    onInputClick,
    onPushNewValueApi,
    renderNoListTips,
    maxLength,
    showBadge = false,
    showRightBtn = false,
    rightBtnText = '确定',
    placeholder = '搜索职位、公司',
    renderThinkItem,
    pagination = false,
    blurEnable = false,
    isShowIcon = true,
    defaultFocus = true,
    onRightButtonClick,
    onSearchResultClick,
  } = props

  const showToast = useToast()
  const [value, setValue] = useState<string>('')
  const [items, setItems] = useState<itemProps[]>([])
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [focus, setFocus] = useState(false)
  const [page, setPage] = useState<number>(1)
  const [status, setStatus] = useState<LoadStatusType>('more')

  /* yyz add 2022-01-07 支持分页 */
  // 请求追加列表
  const appendList = keyword => {
    if (status === 'loading' || status === 'noMore') {
      return
    }

    setStatus('loading')
    return (
      onSearch &&
      onSearch(keyword, page).then(pageData => {
        let data = pageData as IList<IPair>
        const listData = data.list as itemProps[],
          currentStatus = data.current * APP_DEF_PAGE_SIZE >= data.total ? 'noMore' : 'more'
        //首页加载为空弹出提示
        if (page === 1 && !listData.length) {
          resetList()
        } else {
          setItems([...items, ...listData])
          setPage(data.current + 1)
          setStatus(currentStatus)
        }
      })
    )
  }

  const showClear = useMemo(() => {
    return value.length > 0
  }, [value])

  const handleInputClick = () => {
    onInputClick && onInputClick()
  }

  //置空
  const resetList = () => {
    setItems([])
    setPage(0)
    renderNoListTips && renderNoListTips()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInput = useCallback(
    _.throttle(
      (e: BaseEventOrig<InputProps.inputEventDetail>) => {
        const val = e.detail.value
        setFocus(true)
        setValue(val)
        if (val.length === 0) {
          setValue('')
          setItems([])
          onClear && onClear()
        } else if (isValidString(val)) {
          if (pagination) {
            appendList(val)
          } else {
            onSearch &&
              onSearch(val, page)
                .then(res => {
                  if (Array.isArray(res) && res.length > 0) {
                    setItems(res as any)
                  } else {
                    resetList()
                  }
                })
                .catch(() => {
                  resetList()
                })
          }
        }
      },
      100,
      { trailing: false }
    ),
    // (e: BaseEventOrig<InputProps.inputEventDetail>) => {
    //   const val = e.detail.value
    //   setValue(val)
    //  }

    []
  )

  // 确认发起搜索结果
  const handleConfirm = (_e?: any, v?: string, obj?: itemProps) => {
    setIsConfirmed(true)
    const searchValue = v || value
    onConfrim && isValidString(searchValue) && onConfrim(searchValue, obj)
  }

  // 失去焦点发起搜索
  const handleBlur = () => {
    //如果只是取值下拉不需要发起搜索
    if (!isConfirmed && blurEnable) {
      handleConfirm()
    }
  }
  // 获取焦点事件
  const handleFoucs = () => {
    //setItems([])
    setIsConfirmed(false)
    onFocus && onFocus()
  }

  // 处理点击清除
  const handleClear = (event: ITouchEvent) => {
    event.preventDefault()
    setValue('')
    setItems([])
    setFocus(true)
    onClear && onClear()

    if (process.env.TARO_ENV === 'h5') {
      document.querySelector<HTMLInputElement>('.job-search__navbar .weui-input')?.focus()
    }
  }

  // 联想搜索
  const handleItemClick = (e: ITouchEvent, v: itemProps) => {
    if (onSearchResultClick) {
      onSearchResultClick(v.name, v)

      return
    }

    e.preventDefault()
    setValue(v.companyFullName ? v.companyFullName : v.name)
    setFocus(false)
    handleConfirm(undefined, v.name, v)
  }

  // 渲染关键字联想
  const renderThink = () => {
    if (!isValidString(value) || items.length <= 0) return null
    const handler = (v: itemProps, k: number) => {
      if (renderThinkItem) {
        return renderThinkItem(v, value, handleItemClick)
      }

      return (
        <View
          key={k}
          className="searchbar-list__item"
          onClick={e => {
            handleItemClick(e, v)
          }}
        >
          {isShowIcon ? <View className="hd-searchbar__icon  at-icon at-icon-search" /> : null}

          <View
            className={c({ 'searchbar-list__item--right': showBadge })}
            dangerouslySetInnerHTML={{ __html: textHighLight(v.name, value) }}
          ></View>
          {showBadge ? (
            <View
              className={c('searchbar-list__item--badge', {
                jd: v.type === 'jd',
                company: v.type === 'company',
              })}
            >
              {v.type === 'company' ? '公司' : '职位'}
            </View>
          ) : null}
        </View>
      )
    }
    return (
      <>
        {pagination ? (
          <ScrollView
            className="hd-searchbar__list hd-searchbar__scrollview"
            lowerThreshold={300}
            loadMore={() => appendList(value)}
          >
            {items.map(handler)}
          </ScrollView>
        ) : (
          <View className="hd-searchbar__list">{items.map(handler)}</View>
        )}
      </>
    )
  }

  //右边按钮，反馈推送新值
  const handleRightBtnClick = (e: ITouchEvent) => {
    e.preventDefault()

    if (onRightButtonClick) {
      onRightButtonClick(value)

      return
    }

    if (onPushNewValueApi) {
      onPushNewValueApi(value).then(res => {
        res ? onConfrim && onConfrim(value) : showToast({ content: '入库失败' })
      })
    } else {
      onConfrim && onConfrim(value)
    }
  }

  // H5 给 <form> 加上 action 属性，这样手机键盘的“换行”键才会显示为“搜索”
  // useEffect(() => {
  //   if (process.env.TARO_ENV === 'h5') {
  //     Array.from(document.querySelectorAll('.hd-searchbar-form>form')).forEach(item => {
  //       item.setAttribute('action', 'javascript:void 0;')
  //     })
  //   }
  // })

  useReady(() => {
    if (defaultFocus) {
      setFocus(true)
    }
  })

  const InputComponent = () => (
    <Input
      className="hd-searchbar__input"
      value={value}
      onInput={handleInput}
      placeholder={placeholder}
      onConfirm={e => {
        handleConfirm(e, value)
      }}
      confirmType="search"
      onFocus={handleFoucs}
      onBlur={handleBlur}
      maxlength={maxLength || 24}
      focus={focus}
      // @ts-ignore
      type="search"
    />
  )
  //输入框
  const renderInput = () => {
    return (
      <>
        {process.env.TARO_ENV === 'h5' ? (
          <Form className="hd-searchbar-form" onSubmit={_.noop}>
            {InputComponent()}
          </Form>
        ) : (
          InputComponent()
        )}

        {showClear && <View className="at-icon at-icon-close" onTouchStart={handleClear} />}
      </>
    )
  }
  //右边按钮
  const renderRightButton = () => {
    return (
      <View className="hd-searchbar__rightBtn" onClick={handleRightBtnClick}>
        {rightBtnText}
      </View>
    )
  }
  return (
    <>
      <View className={c(className, 'hd-searchbar__search')} onClick={handleInputClick}>
        {isShowIcon ? <View className="hd-searchbar__icon  at-icon at-icon-search" /> : null}

        {renderInput()}
        {showRightBtn && value ? renderRightButton() : null}
      </View>
      {renderThink()}
    </>
  )
}

export default React.forwardRef(ThinkInput)
