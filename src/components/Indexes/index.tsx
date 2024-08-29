import classNames from 'classnames'
import React from 'react'
import { ITouchEvent, ScrollView, View } from '@tarojs/components'
import Taro, { pageScrollTo } from '@tarojs/taro'
import { AtToast } from 'taro-ui'

import ChooseButton from '@/components/ChooseButton'
import { delayQuerySelector, isTest, pxTransform, uuid } from '@/utils/taroUtils'
import './index.scss'
import { isValidString } from '@/services/StringService'

const ENV = Taro.getEnv()

export type IndexesProps = Omit<typeof AtIndexes.defaultProps, 'list'> & {
  onClick: (item: any) => void
  onScrollIntoView: Function
  list: any[]
}

type IndexesState = {
  _scrollTop: number
  _tipText: string
  _scrollIntoView: string
  _isShowToast: boolean
  isWEB: boolean
}

export default class AtIndexes extends React.Component<IndexesProps, IndexesState> {
  static defaultProps = {
    customStyle: '',
    className: '',
    animation: false,
    topKey: 'Top',
    isVibrate: true,
    isShowToast: true,
    list: [],
  }

  constructor(props) {
    super(props)
    this.handleClick = item => {
      this.props.onClick && this.props.onClick(item)
    }
    this.handleTouchMove = event => {
      event.stopPropagation()
      event.preventDefault()
      const { list } = this.props
      const pageY = event.touches[0].pageY
      const index = Math.floor((pageY - this.startTop) / this.itemHeight)
      if (index >= 0 && index <= list.length && this.currentIndex !== index) {
        this.currentIndex = index
        const key = index > 0 ? list[index - 1].key : 'top'
        const touchView = `at-indexes__list-${key}`
        this.jumpTarget(touchView, index)
      }
    }
    this.handleTouchEnd = () => {
      this.currentIndex = -1
    }
    this.state = {
      _scrollIntoView: '',
      _scrollTop: 0,
      _tipText: '',
      _isShowToast: false,
      isWEB: Taro.getEnv() === Taro.ENV_TYPE.WEB,
    }

    this.listId = isTest() ? 'indexes-list-AOTU2018' : `list-${uuid()}`
    this.props.onScrollIntoView && this.props.onScrollIntoView(this.__jumpTarget.bind(this))
  }



  componentDidMount() {
    if ([Taro.ENV_TYPE.WEB,Taro.ENV_TYPE.WEAPP].indexOf(ENV)>-1) {
      this.listRef = document.getElementById(this.listId)
    }
    this.initData()
  }

  componentDidUpdate(prevProps) {
    if (this.props.list.length !== prevProps.list.length) {
      this.initData()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutTimer)
    this.timeoutTimer = null
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   if (nextProps.list.length !== this.props.list.length) {
  //     this.initData()
  //   }
  // }
  menuHeight = 0 // 右侧导航高度
  startTop = 0 // 右侧导航距离顶部高度
  itemHeight = 0 // 右侧导航元素高度
  currentIndex = -1 // 当前索引
  listId: string
  listRef: any
  timeoutTimer: any
  handleClick: Func1<any, void>
  handleTouchMove: Func1<ITouchEvent, void>
  handleTouchEnd: Func0<void>

  jumpTarget(_scrollIntoView, idx) {
    const { topKey = 'Top', list } = this.props
    const _tipText = idx === 0 ? topKey : list[idx - 1].key
    if (ENV === Taro.ENV_TYPE.WEB) {
      delayQuerySelector('.at-indexes', 0).then(rect => {
        let node = this.listRef.childNodes[idx]

        if (idx === 1 && node['s-sr']) {
          node = this.listRef.childNodes[idx + 1]
        }

        if (isValidString(node.id) && node.id.slice(-1) !== _tipText) {
          node = this.listRef.childNodes[idx + 1]
        }

        const targetOffsetTop = node.offsetTop || node['s-nr']?.offsetTop || 0
        const _scrollTop = targetOffsetTop - rect[0].top
        pageScrollTo({ scrollTop: targetOffsetTop - 40 })
        this.updateState({
          _scrollTop,
          _scrollIntoView,
          _tipText,
        })
      })
      return
    }
    /* =======================20210616 start======================= */
    if(ENV === Taro.ENV_TYPE.WEAPP){
      delayQuerySelector('.at-indexes', 0).then(rect => {
        if(idx)
        {
          let node = this.listRef.childNodes[idx-1]
          delayQuerySelector(`#${node.uid}`, 0).then(temprect=>{
            const targetOffsetTop = temprect[0].top
            const _scrollTop = targetOffsetTop - rect[0].top
            pageScrollTo({ scrollTop: _scrollTop })
            // this.updateState({
            //   _scrollTop,
            //   _scrollIntoView,
            //   _tipText,
            // })
          })
        }else{
          pageScrollTo({ scrollTop:0 })
        }
      })
      return
    }
    /* =======================20210616 end======================= */
    this.updateState({
      _scrollIntoView,
      _tipText,
    })
  }
  __jumpTarget(key) {
    const { list } = this.props
    const index = list.findIndex(item => item.key === key)
    const targetView = `at-indexes__list-${key}`

    this.jumpTarget(targetView, index + 1)
  }
  updateState(state) {
    const { isShowToast, isVibrate } = this.props
    const { _scrollIntoView, _tipText, _scrollTop } = state
    this.setState(
      {
        _scrollIntoView: _scrollIntoView,
        _tipText: _tipText,
        _scrollTop: _scrollTop,
        _isShowToast: isShowToast,
      },
      () => {
        clearTimeout(this.timeoutTimer)
        this.timeoutTimer = setTimeout(() => {
          this.setState({
            _tipText: '',
            _isShowToast: false,
          })
        }, 3000)
      }
    )
    if (isVibrate) {
      Taro.vibrateShort()
    }
  }
  initData() {
    delayQuerySelector('.at-indexes__menu').then(rect => {
      const len = this.props.list.length
      this.menuHeight = rect[0].height
      this.startTop = rect[0].top
      this.itemHeight = Math.floor(this.menuHeight / (len + 1))
    })
  }
  handleScroll(e) {
    if (e && e.detail) {
      this.setState({
        _scrollTop: e.detail.scrollTop,
      })
    }
  }

  render() {
    const { className, customStyle, animation, topKey, list } = this.props
    const { _scrollTop, _scrollIntoView, _tipText, _isShowToast, isWEB } = this.state
    const toastStyle = { minWidth: pxTransform(100) }
    const rootCls = classNames('at-indexes', className)
    const menuList = list.map((dataList, i) => {
      const { key } = dataList
      const targetView = `at-indexes__list-${key}`

      return (
        <View
          className="at-indexes__menu-item"
          key={key}
          onClick={this.jumpTarget.bind(this, targetView, i + 1)}
        >
          {key}
        </View>
      )
    })

    const indexesList = list.map(dataList => (
      <View id={`at-indexes__list-${dataList.key}`} className="at-indexes__list" key={dataList.key}>
        <View className="at-indexes__list-title">{dataList.title}</View>
        <View>
          {dataList.items &&
            dataList.items.map(item => (
              <ChooseButton key={item.id} item={item} onClick={this.handleClick.bind(this, item)} />
            ))}
        </View>
      </View>
    ))

    return (
      <View className={rootCls} style={customStyle}>
        <AtToast customStyle={toastStyle} isOpened={_isShowToast} text={_tipText} duration={2000} />
        <View
          className="at-indexes__menu"
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
        >
          <View
            className="at-indexes__menu-item"
            onClick={this.jumpTarget.bind(this, 'at-indexes__top', 0)}
          >
            {topKey}
          </View>
          {menuList}
        </View>
        <ScrollView
          className="at-indexes__body"
          scrollY
          scrollWithAnimation={animation}
          scrollTop={isWEB ? _scrollTop : undefined}
          scrollIntoView={!isWEB ? _scrollIntoView : ''}
          onScroll={this.handleScroll.bind(this)}
        >
          <View className="at-indexes__content" id="at-indexes__top">
            {this.props.children}
          </View>
          <View id={this.listId}>{indexesList}</View>
        </ScrollView>
      </View>
    )
  }
}
