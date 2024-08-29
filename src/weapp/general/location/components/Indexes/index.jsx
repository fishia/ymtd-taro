import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { ScrollView, View } from '@tarojs/components'
import Taro, { pageScrollTo } from '@tarojs/taro'
import { AtToast } from 'taro-ui'

import CityButton from '../CityButton'
import { delayQuerySelector, isTest, pxTransform, uuid } from '@/utils/taroUtils'
import './index.scss'
import { isValidString } from '@/services/StringService'

const ENV = Taro.getEnv()

export default class AtIndexes extends React.Component {
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
    // 右侧导航高度
    this.menuHeight = 0
    // 右侧导航距离顶部高度
    this.startTop = 0
    // 右侧导航元素高度
    this.itemHeight = 0
    // 当前索引
    this.currentIndex = -1
    this.listId = isTest() ? 'indexes-list-AOTU2018' : `list-${uuid()}`
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.list.length !== this.props.list.length) {
      this.initData()
    }
  }

  componentDidMount() {
    if ([Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.WEAPP].indexOf(ENV) > -1) {
      this.listRef = document.getElementById(this.listId)
    }
    this.initData()
  }
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
    if (ENV === Taro.ENV_TYPE.WEAPP) {
      delayQuerySelector('.at-indexes', 0).then(rect => {
        if (idx) {
          let node = this.listRef.childNodes[idx - 1]
          delayQuerySelector(`#${node.uid}`, 0).then(temprect => {
            const targetOffsetTop = temprect[0].top
            const _scrollTop = targetOffsetTop - rect[0].top
            pageScrollTo({ scrollTop: _scrollTop })
            // this.updateState({
            //   _scrollTop,
            //   _scrollIntoView,
            //   _tipText,
            // })
          })
        } else {
          pageScrollTo({ scrollTop: 0 })
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
    // const index = _findIndex(list, ['key', key])
    const index = list.findIndex(item => item.key === key)
    const targetView = `at-indexes__list-${key}`

    this.jumpTarget(targetView, index + 1)
  }
  updateState(state) {
    const { isShowToast, isVibrate } = this.props
    const { _scrollIntoView, _tipText, _scrollTop } = state
    // TODO: Fix dirty hack
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    this.setState(
      {
        _scrollIntoView: _scrollIntoView,
        _tipText: _tipText,
        _scrollTop: _scrollTop,
        _isShowToast: isShowToast,
      },
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
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
  UNSAFE_componentWillMount() {
    this.props.onScrollIntoView && this.props.onScrollIntoView(this.__jumpTarget.bind(this))
  }
  render() {
    const { className, customStyle, animation, topKey, list, selectionIds } = this.props
    const { _scrollTop, _scrollIntoView, _tipText, _isShowToast, isWEB } = this.state
    const toastStyle = { minWidth: pxTransform(100) }
    const rootCls = classNames('at-indexes', className)
    const menuList = list.map((dataList, i) => {
      const { key } = dataList
      const targetView = `at-indexes__list-${key}`
      return React.createElement(
        View,
        {
          className: 'at-indexes__menu-item',
          key,
          onClick: this.jumpTarget.bind(this, targetView, i + 1),
        },
        key
      )
    })
    const indexesList = list.map(dataList =>
      React.createElement(
        View,
        {
          id: `at-indexes__list-${dataList.key}`,
          className: 'at-indexes__list',
          key: dataList.key,
        },
        React.createElement(View, { className: 'at-indexes__list-title' }, dataList.title),
        React.createElement(
          View,
          null,
          dataList.items &&
            dataList.items.map(item =>
              React.createElement(
                CityButton,
                {
                  key: item.id,
                  selected: selectionIds.includes(item.id),
                  onClick: this.handleClick.bind(this, item),
                },
                item.name
              )
            )
        )
      )
    )

    return React.createElement(
      View,
      { className: rootCls, style: customStyle },
      React.createElement(AtToast, {
        customStyle: toastStyle,
        isOpened: _isShowToast,
        text: _tipText,
        duration: 2000,
      }),
      React.createElement(
        View,
        {
          className: 'at-indexes__menu',
          onTouchMove: this.handleTouchMove,
          onTouchEnd: this.handleTouchEnd,
        },
        React.createElement(
          View,
          {
            className: 'at-indexes__menu-item',
            onClick: this.jumpTarget.bind(this, 'at-indexes__top', 0),
            key:'#'
          },
          topKey
        ),
        menuList
      ),
      React.createElement(
        ScrollView,
        {
          className: 'at-indexes__body',

          scrollY: true,
          scrollWithAnimation: animation,
          // eslint-disable-next-line no-undefined
          scrollTop: isWEB ? _scrollTop : undefined,
          scrollIntoView: !isWEB ? _scrollIntoView : '',
          onScroll: this.handleScroll.bind(this),
        },
        [
          React.createElement(
            View,
            { className: 'at-indexes__content', id: 'at-indexes__top' ,key:'content'},
            this.props.children
          ),
          React.createElement(View, { id: this.listId,key:'indexesList' }, indexesList),
        ]
      )
    )
  }
}

AtIndexes.propTypes = {
  customStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  className: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  animation: PropTypes.bool,
  isVibrate: PropTypes.bool,
  isShowToast: PropTypes.bool,
  topKey: PropTypes.string,
  list: PropTypes.array,
  onClick: PropTypes.func,
  onScrollIntoView: PropTypes.func,
  selectionIds: PropTypes.array,
}

AtIndexes.defaultProps = {
  customStyle: '',
  className: '',
  animation: false,
  topKey: 'Top',
  isVibrate: true,
  isShowToast: true,
  list: [],
  selectionIds: [],
}
