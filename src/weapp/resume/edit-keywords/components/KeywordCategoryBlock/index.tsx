
import React from 'react'
import { View } from '@tarojs/components'
import { ICurrentKeyword, IKeyword } from '@/def/resume'
import KeywordButton from '@/weapp/general/job-categories/components/JobCategoryButton'
import './index.scss'

export interface KeywordCategoryBlockProps extends IKeyword {
  handleKeywordClick: (singleKeyword: ICurrentKeyword) => void
  isKeywordSelected: (singleKeyword: ICurrentKeyword) => boolean
}

export const CategoryTitle = props => <View className="keyword-categories__block__title">{props.title}</View>


const KeywordCategoryBlock: React.FC<KeywordCategoryBlockProps> = props => {
  const {
    handleKeywordClick,
    isKeywordSelected,
    id,
    name,
    keyword
  } = props;
  return <View className="keyword-categories__block" key={id}>
    <CategoryTitle title={name} />
    <View className="keyword-categories__block__content">
      {(keyword || []).map(singleKeyword => (
        <KeywordButton
          onClick={() =>
            void handleKeywordClick(singleKeyword)
          }
          selected={isKeywordSelected(singleKeyword)}
          key={singleKeyword.keyword_id}
          className="keyword-categories__block__button"
        >
          {singleKeyword.keyword_name}
        </KeywordButton>
      ))}
    </View>
  </View>
}

export default KeywordCategoryBlock
