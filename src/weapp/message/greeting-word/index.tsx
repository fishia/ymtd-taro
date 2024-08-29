import { FC, useEffect, useMemo, useState } from 'react'
import c from 'classnames'
import {
  eventCenter,
  getSystemInfoSync,
  hideLoading,
  showLoading,
  usePageScroll,
} from '@tarojs/taro'
import { ScrollView, View, Image } from '@tarojs/components'
import { AtSwipeAction } from 'taro-ui'

import { IGreetingWord, IGreetingWordGroup } from '@/def/message'
import { deleteGreetingWordApi, liseGreetingWordApi, setGreetingWordApi } from '@/apis/message'
import useToast from '@/hooks/custom/useToast'
import MainLayout from '@/layout/MainLayout'
import Button from '@/components/Button'
import goInputPage, { changeGreetingWordEventKey } from '../text-input/textInputContext'

import editIcon from '../assets/edit-icon.png'
import checkIcon from '../assets/check-icon.png'
import emptyBackground from '../assets/empty-background.png'
import './index.scss'
import GreetingWordTips from './GreetingWordTips'

const areaWidth = (590 / 750) * getSystemInfoSync().screenWidth
const deleteAreaDistance = 40
const deleteIconLeft = 46

const swipeActionOptions = [
  {
    text: '',
    className: 'greeting-word__list-item__delete',
    style: { backgroundPosition: `top ${32}rpx left ${deleteIconLeft}rpx` },
  },
]

const customGroupId = 9

const GreetingWordPage: FC = () => {
  const showToast = useToast()

  const [greetingWords, setGreetingWords] = useState<IGreetingWordGroup[]>([])
  const [currentGroupId, setCurrentGroupId] = useState<number>()
  const currentGroup = greetingWords.find(item => item.value === currentGroupId)

  const [openItem, setOpenItem] = useState<number>()

  const canAdd = useMemo(
    () => greetingWords.reduce((total, group) => (total += group.greetList.length), 0) < 20,
    [greetingWords]
  )

  usePageScroll(scrollInfo => {
    if (scrollInfo.scrollTop > 10) {
      setOpenItem(undefined)
    }
  })

  useEffect(() => {
    showLoading({ title: '加载中...' })
    liseGreetingWordApi()
      .then(res => {
        setGreetingWords(res)
        const selectValue = (res || []).find(item => item.checked)?.value
        setCurrentGroupId(selectValue || res[0].value)
      })
      .catch(error => showToast({ content: '获取招呼语失败，请稍后重试' || error.errorMessage }))
      .finally(hideLoading)

    const changeCallback = () => void liseGreetingWordApi().then(setGreetingWords)
    eventCenter.on(changeGreetingWordEventKey, changeCallback)

    return () => void eventCenter.off(changeGreetingWordEventKey, changeCallback)
  }, [showToast])

  const addHandler = () => {
    goInputPage({ mode: 'greeting-word', id: 0 })
  }

  const editHandler = (editItem: IGreetingWord) => {
    goInputPage({ mode: 'greeting-word', id: editItem.value, defaultText: editItem.content })
  }

  const deleteHandler = (editItem: IGreetingWord) => {
    deleteGreetingWordApi(editItem.value)
      .then(() => void liseGreetingWordApi().then(setGreetingWords))
      .catch(error => void showToast({ content: error.errorMessage || '设置失败，请稍后重试' }))
  }

  const checkHandler = (checkItem: IGreetingWord) => {
    if (checkItem.checked) {
      return
    }

    setGreetingWordApi(checkItem.value)
      .then(() => {
        showToast({ content: '设置成功' })
        liseGreetingWordApi().then(setGreetingWords)
      })
      .catch(error => void showToast({ content: error.errorMessage || '设置失败，请稍后重试' }))
  }

  return (
    <MainLayout className="greeting-word">
      <View className="greeting-word__tips">选中的招呼语在下次新开始聊天时自动发送</View>

      <View className="greeting-word__body">
        <ScrollView className="greeting-word__group" scrollY>
          {greetingWords.map(group => (
            <View
              className={c('greeting-word__group-item', currentGroup === group ? 'checked' : '')}
              key={String(group.value) + group.checked}
              onClick={() => {
                setCurrentGroupId(group.value)
                setOpenItem(undefined)
              }}
            >
              {group.content}
            </View>
          ))}
        </ScrollView>

        <ScrollView className="greeting-word__list" scrollY>
          {(currentGroup?.greetList || []).map((item, listIndex) => (
            <View className="greeting-word__list-item" key={item.value}>
              {item.checked || currentGroup?.value !== customGroupId ? (
                <View onClick={() => void checkHandler(item)} className="greeting-word__list-item">
                  <View className="greeting-word__list-item__content">
                    <View
                      className={c(
                        'greeting-word__list-item__text',
                        item.checked ? 'checked' : '',
                        currentGroup?.value === customGroupId ? 'custom' : ''
                      )}
                    >
                      {item.content}
                    </View>

                    {item.checked ? (
                      <Image className="greeting-word__list-item__checked" src={checkIcon} />
                    ) : null}

                    {currentGroup?.value === customGroupId ? (
                      <View
                        className="greeting-word__list-item__action"
                        onClick={() => void editHandler(item)}
                      >
                        <Image className="greeting-word__list-item__edit" src={editIcon} />
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : (
                <AtSwipeAction
                  options={swipeActionOptions}
                  maxDistance={deleteAreaDistance}
                  areaWidth={areaWidth}
                  className="greeting-word__list-item"
                  onClick={(_props, index) => {
                    if (index === 0) {
                      deleteHandler(item)
                    }
                  }}
                  onOpened={() => void setOpenItem(item.value)}
                  onClosed={() => void setOpenItem(undefined)}
                  isOpened={openItem === item.value}
                >
                  <View className="greeting-word__list-item__content">
                    <View
                      onClick={() => void checkHandler(item)}
                      className={c(
                        'greeting-word__list-item__text custom',
                        item.checked ? 'checked' : ''
                      )}
                    >
                      {item.content}
                    </View>

                    {item.checked ? (
                      <Image className="greeting-word__list-item__checked" src={checkIcon} />
                    ) : null}

                    <View
                      onClick={() => void editHandler(item)}
                      className="greeting-word__list-item__action"
                    >
                      <Image className="greeting-word__list-item__edit" src={editIcon} />
                    </View>
                  </View>
                </AtSwipeAction>
              )}

              {currentGroup?.value === customGroupId &&
              (currentGroup?.greetList || []).length === 1 &&
              listIndex === 0 ? (
                <GreetingWordTips />
              ) : null}
            </View>
          ))}

          {(currentGroup?.greetList || []).length <= 0 ? (
            <View className="greeting-word__list-empty">
              <Image
                className="greeting-word__list-empty__bg"
                src={emptyBackground}
                mode="widthFix"
              />
              <View className="greeting-word__list-empty__tips">暂无自定义招呼语</View>
            </View>
          ) : null}
        </ScrollView>

        {currentGroupId === customGroupId ? (
          <View className="greeting-word__action">
            {canAdd ? (
              <Button onClick={addHandler} className="greeting-word__button" btnType="primary">
                添加招呼语
              </Button>
            ) : (
              <View className="greeting-word__full-tips">暂不可新增更多招呼语，每人最多20条</View>
            )}
          </View>
        ) : null}
      </View>
    </MainLayout>
  )
}

export default GreetingWordPage
