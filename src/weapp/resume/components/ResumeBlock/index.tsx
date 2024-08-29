import React from 'react'
import c from 'classnames'
import _ from 'lodash'
import { View, Text } from '@tarojs/components'
import { IProps } from '@/def/common'

import './index.scss'

type ResumeBlockExportType = React.FC<IResumeBlockProps> & {
  ResumeExpList: React.FC
  ResumeExpListItem: React.FC
  ResumeRow: React.FC
  ResumeHeader: React.FC
}

export interface IResumeBlockProps extends IProps {
  title?: string
  required?: boolean
  icon?: string | null
  onClick?(): void
  onIconClick?(): void
}

const ResumeBlock: ResumeBlockExportType = props => {
  const {
    style,
    className,
    title,
    required = false,
    icon = 'icontianjia1',
    onClick = _.noop,
    onIconClick = _.noop,
  } = props

  const Header = () => (
    <View className="resume-block__header">
      <Text className="resume-block__header__title">{title}</Text>
      {required ? <View className="resume-block__header__required">必填</View> : null}
      {icon ? (
        <View className="resume-block__header__icon" onClick={onIconClick}>
          <View className={c('icon iconfont', icon)} />
        </View>
      ) : null}
    </View>
  )

  return (
    <View className={c('resume-block', className)} style={style} onClick={onClick}>
      {title ? <Header /> : null}
      {props.children}
    </View>
  )
}

export interface IResumeExpListProps extends IProps {}

const ResumeExpList: React.FC<IResumeExpListProps> = props => {
  const { className, style } = props

  return (
    <View className={c('resume-block-list', className)} style={style}>
      {props.children}
    </View>
  )
}

export interface IResumeExpListItemProps extends IProps {
  onEditClick?(...args: any[]): void
  noLine?: boolean
}

const ResumeExpListItem: React.FC<IResumeExpListItemProps> = props => {
  const { className, style, noLine = false, onEditClick = _.noop } = props

  return (
    <View
      className={c('resume-block-item', className, noLine ? 'noline' : 'line')}
      style={style}
      onClick={onEditClick}
    >
      {props.children}
    </View>
  )
}
export interface IResumeHeaderrops extends IProps {
  title: string
  extra?: string
  hint?: boolean
  elem?: React.ReactNode
  noExtraTips?: string
}

const ResumeHeader: React.FC<IResumeHeaderrops> = props => {
  const {
    className,
    style,
    extra,
    title = '',
    hint = false,
    elem,
    noExtraTips = '补全时间',
  } = props

  return (
    <View className={c('resume-block-header', className)} style={style}>
      {hint ? (
        <>
          <View className="resume-block-header__title">{elem}</View>
          <View
            className={c(
              { 'resume-block-header__extra': extra },
              { 'resume-block-header--hint': !extra }
            )}
          >
            {extra ? extra : noExtraTips}
          </View>
        </>
      ) : (
        <>
          <View className="resume-block-header__title">{title}</View>
          extra && <View className="resume-block-header__extra">{extra}</View>
        </>
      )}
      <View className="resume-block-header__icon at-icon at-icon-chevron-right"></View>
    </View>
  )
}

export interface IResumeRowProps extends IProps {}

const ResumeRow: React.FC<IResumeRowProps> = props => {
  const { className, style } = props

  return (
    <View className={c('resume-block-row', className)} style={style}>
      {props.children}
    </View>
  )
}

ResumeBlock.ResumeExpList = ResumeExpList
ResumeBlock.ResumeExpListItem = ResumeExpListItem
ResumeBlock.ResumeRow = ResumeRow
ResumeBlock.ResumeHeader = ResumeHeader

export default ResumeBlock
export { ResumeBlock, ResumeExpList, ResumeExpListItem, ResumeRow, ResumeHeader }
