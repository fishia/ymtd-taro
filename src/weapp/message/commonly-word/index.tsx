import { FC, useEffect, useState } from 'react'
import { getSystemInfoSync, hideLoading, showLoading, usePageScroll } from '@tarojs/taro'
import { Image, View } from '@tarojs/components'
import { AtSwipeAction } from 'taro-ui'

import { ICommonlyWord } from '@/def/message'
import { dispatchRemoveCommonlyWordsById, dispatchSetCommonlyWords } from '@/store'
import { deleteCommonlyWordApi, listCommonlyWordListApi } from '@/apis/message'
import useToast from '@/hooks/custom/useToast'
import { useCommonlyWords } from '@/hooks/message'
import MainLayout from '@/layout/MainLayout'
import Button from '@/components/Button'
import goInputPage from '../text-input/textInputContext'

import editIcon from '../assets/edit-icon.png'
import './index.scss'

const screenWidth = getSystemInfoSync().screenWidth
const deleteAreaDistance = 40
const deleteIconLeft = 46

const swipeActionOptions = [
  {
    text: '',
    className: 'commonly-word__item__delete',
    style: { backgroundPosition: `top ${32}rpx left ${deleteIconLeft}rpx` },
  },
]

const ItemContent: FC<{
  commonlyWordItem: ICommonlyWord
  onEdit(item: ICommonlyWord): void
}> = props => (
  <View className="commonly-word__item__content">
    <View className="commonly-word__item__text">{props.commonlyWordItem.content}</View>
    <View
      onClick={() => void props.onEdit(props.commonlyWordItem)}
      className="commonly-word__item__action"
    >
      <Image className="commonly-word__item__edit" src={editIcon} />
    </View>
  </View>
)

const CommonlyWordPage: FC = () => {
  const showToast = useToast()
  const commonlyWords = useCommonlyWords()

  const [openItemId, setOpenItemId] = useState<number>()

  useEffect(() => {
    showLoading({ title: '加载中' })
    listCommonlyWordListApi()
      .then(dispatchSetCommonlyWords)
      .catch(() => showToast({ content: '获取常用语失败，请重试' }))
      .finally(hideLoading)
  }, [showToast])

  usePageScroll(scrollInfo => {
    if (scrollInfo.scrollTop > 10) {
      setOpenItemId(undefined)
    }
  })

  const addCommonlyWord = () => {
    goInputPage({ mode: 'commonly-word', id: 0 })
  }

  const editHandler = (item: ICommonlyWord) => {
    goInputPage({ mode: 'commonly-word', id: item.commonWordsId, defaultText: item.content })
  }

  const deleteHandler = (item: ICommonlyWord) => {
    deleteCommonlyWordApi(item.commonWordsId)
      .then(() => void dispatchRemoveCommonlyWordsById(item.commonWordsId))
      .catch(error => void showToast({ content: error.errorMessage || '删除失败，请稍后重试' }))
  }

  return (
    <MainLayout className="commonly-word">
      <View className="commonly-word__list">
        {commonlyWords.map(item => (
          <View className="commonly-word__item" key={item.commonWordsId}>
            {item.commonWordsType === 0 ? (
              <ItemContent commonlyWordItem={item} onEdit={editHandler} />
            ) : (
              <AtSwipeAction
                options={swipeActionOptions}
                maxDistance={deleteAreaDistance}
                areaWidth={screenWidth}
                className="commonly-word__item"
                onClick={(_props, index) => {
                  if (index === 0) {
                    deleteHandler(item)
                  }
                }}
                onOpened={() => void setOpenItemId(item.commonWordsId)}
                onClosed={() => void setOpenItemId(undefined)}
                isOpened={openItemId === item.commonWordsId}
              >
                <ItemContent commonlyWordItem={item} onEdit={editHandler} />
              </AtSwipeAction>
            )}
          </View>
        ))}
      </View>

      <View className="commonly-word__action">
        {commonlyWords.length >= 20 ? (
          <View className="commonly-word__full-tips">暂不可新增更多常用语，每人最多20条</View>
        ) : (
          <Button onClick={addCommonlyWord} className="commonly-word__button" btnType="primary">
            添加常用语
          </Button>
        )}
      </View>
    </MainLayout>
  )
}

export default CommonlyWordPage
