import { View, Text, ITouchEvent, RichText } from '@tarojs/components'
import {
  useRouter,
  redirectTo,
  navigateBack,
  eventCenter,
  useShareAppMessage,
  showLoading,
  hideLoading,
  useShareTimeline,
} from '@tarojs/taro'
import c from 'classnames'
import R from 'ramda'
import React, { useEffect, useMemo, useState } from 'react'

import { handleStaticUrl } from '@/apis/client/handleRequestOption'
import { detailArticleApi, favoriteArticleApi, deleteArticleFavoriteApi } from '@/apis/discover'
import Loading from '@/components/Loading'
import { OPERATION_HOST } from '@/config'
import { PageStatus } from '@/def/common'
import { IDiscoverArticle } from '@/def/discover'
import { useShowLoginPopup } from '@/hooks/custom/usePopup'
import useToast from '@/hooks/custom/useToast'
import { useCurrentUserInfo, useIsLogin } from '@/hooks/custom/useUser'
import { useAsync } from '@/hooks/sideEffects/useAsync'
import MainLayout from '@/layout/MainLayout'
import { previewResumeAttachment } from '@/services/ResumeService'
import { dispatchAddUserFavorite, dispatchDeleteUserFavorite } from '@/store'
import { sendDataRangersEvent, sendDataRangersEventWithUrl } from '@/utils/dataRangers'

import './index.scss'

const ArticleDetail: React.FC = () => {
  const router = useRouter()
  const showToast = useToast()
  const showLoginPopup = useShowLoginPopup()
  const isLogin = useIsLogin()

  const [pageStatus, setPageStatus] = useState<PageStatus>(PageStatus.LOADING)
  const [detail, setDetail] = useState<IDiscoverArticle>({ body: '', title: '', updated_at: '' })

  const articleId = router.params.id ? +router.params.id : 0
  const source = router.params.source ? router.params.source : 'article'
  const isLogined = useIsLogin()
  const userInfo = useCurrentUserInfo()!

  const attachment = useMemo(() => detail?.attachments?.[0], [detail])

  const isFavorited = useMemo(() => {
    return userInfo?.favorite_article_ids && R.includes(articleId, userInfo.favorite_article_ids)
  }, [userInfo?.favorite_article_ids, articleId])

  const fetchState = useAsync(() => {
    if (!articleId) {
      redirectTo({ url: '/weapp/general/error/index' })
      return new Promise(resolve => resolve)
    }
    return detailArticleApi(articleId, source)
  }, [articleId])

  //转意符换成普通字符
  function escape2Html(str) {
    var arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' }
    return str
      .replace(/&(lt|gt|nbsp|amp|quot);/gi, function (_all, t) {
        return arrEntities[t]
      })
      .replace(/<img /g, '<img class="rich_img" ')
      .replace(/<h2/g, '<span class="h2"')
      .replace(/<\/h2>/g, '</span>')
      .replace(/<p>/g, '<span class="p">')
      .replace(/<\/p>/g, '</span>')
      .replace(/tp=webp/g, 'tp=png')
  }

  const handleFetchValue = fetchValue => {
    const result: IDiscoverArticle | null = R.pathOr(null, ['value'], fetchValue)

    //文章被删除
    if (Array.isArray(result)) {
      eventCenter.trigger('favorite-delete', 'article', Number(articleId))
      showToast({
        content: '该文章已被删除，即将返回',
        duration: 2000,
        onClose: () => navigateBack(),
      })
      return
    }
    if (result === null) {
      setPageStatus(PageStatus.ERROR)
      return
    }
    setDetail(result)
    setPageStatus(PageStatus.FINISHED)
  }

  // 监听请求变化
  useEffect(() => {
    const switchFn = R.cond([
      [
        R.prop('loading'),
        () => {
          setPageStatus(PageStatus.LOADING)
        },
      ],
      [
        R.prop('error'),
        state => {
          const content = R.pathOr('加载失败', ['error', 'errorMessage'])(state)
          showToast({ content })
          setPageStatus(PageStatus.ERROR)
          return
        },
      ],
      [
        R.prop('value'),
        state => {
          if (state?.value?.attachments?.[0]) {
            sendDataRangersEventWithUrl('EventPopupExpose', { event_name: '2023薪酬报告' })
          }

          handleFetchValue(state)
          return
        },
      ],
      [R.T, () => {}],
    ])
    switchFn(fetchState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchState, showToast])

  const handleFavorite = (event: ITouchEvent) => {
    event.stopPropagation()
    //收藏需检查是否已登录
    if (!isLogined) {
      showLoginPopup().then().catch()
      return
    }
    if (!isFavorited) {
      favoriteArticleApi(articleId)
        .then(() => {
          showToast({ content: '收藏成功' })
          dispatchAddUserFavorite('article', articleId)
        })
        .catch(({ errorMessage }) => {
          showToast({ content: errorMessage || '收藏失败' })
        })
    } else {
      deleteArticleFavoriteApi(articleId)
        .then(() => {
          showToast({ content: '已取消收藏' })
          dispatchDeleteUserFavorite('article', articleId)
        })
        .catch(({ errorMessage }) => {
          showToast({ content: errorMessage || '取消收藏失败' })
        })
    }
  }

  const attachmentHandler = () => {
    sendDataRangersEvent('FullReportClick', { event_name: '2023薪酬报告' })

    // if (!isLogin) {
    //   showLoginPopup()
    //   return
    // }

    if (attachment) {
      showLoading({ title: '加载中…', mask: true })
      previewResumeAttachment(`${OPERATION_HOST}${attachment.url}`, attachment.name).finally(
        () => void hideLoading()
      )
    }
  }

  useShareAppMessage(() => ({
    path: `/weapp/discover/discover-detail/index?id=${articleId}&source=article`,
    title: detail.mpTitle || undefined,
    imageUrl: detail.mpPreviewImage ? handleStaticUrl(detail.mpPreviewImage) : undefined,
  }))

  useShareTimeline(() => ({
    title: detail.mpTitle || undefined,
    query: `id=${articleId}&source=article`,
    imageUrl: detail.appLogo
      ? handleStaticUrl(detail.appLogo)
      : detail.mpPreviewImage
      ? handleStaticUrl(detail.mpPreviewImage)
      : undefined,
  }))

  const Content = () => (
    <>
      <View className="article-detail">
        <View className="article-detail__title">{detail.title}</View>
        <View className="Typetime">
          <Text className="article-detail__time">{detail.updated_at}</Text>
        </View>
        <View className="article-detail__content">
          <RichText nodes={escape2Html(detail.body)} />
        </View>
      </View>
      {isLogin || attachment ? (
        <View className="article-detail__submitbar">
          {isLogin ? (
            <View
              onClick={handleFavorite}
              className={c('article-detail__favorite', {
                'article-detail--favorited': isFavorited,
              })}
            >
              {isFavorited ? '已收藏' : '收藏'}
            </View>
          ) : null}
          {attachment ? (
            <View onClick={attachmentHandler} className="article-detail__attachment">
              查看完整报告
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  )

  const renderContent = () => {
    switch (pageStatus) {
      case PageStatus.ERROR:
        redirectTo({ url: '/weapp/general/error/index' })
      case PageStatus.LOADING:
        return <Loading />
      case PageStatus.FINISHED:
        return <Content />
      default:
        redirectTo({ url: '/weapp/general/error/index' })
    }
  }

  return <MainLayout>{renderContent()}</MainLayout>
}

export default ArticleDetail
