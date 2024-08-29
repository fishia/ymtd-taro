const IS_PROD = process.env.ENV === 'production'

// 通用配置

// 后台 URL
export const ONLINE_HOST = IS_PROD
  ? 'https://wx.yimaitongdao.com/api'
  : 'https://test-wx.yimaitongdao.com/api'

export const NEW_ONLINE_HOST = IS_PROD
  ? 'https://api.yimaitongdao.com'
  : 'https://test-api.yimaitongdao.com'

export const APP_DOWNLOAD =
  'https://mp.weixin.qq.com/s?__biz=MzU1MzE3MzMyMA==&mid=2247495613&idx=1&sn=03eb5d3346ff93c50b4f01a0e14cf87d&chksm=fbf4479acc83ce8cfaa43c9f9d93d67166b850a8e5f2ff21099a166e1ea5d03e9e7fc8263d1a&token=1860607010&lang=zh_CN#rd'

// 静态资源 URL
export const STATIC_HOST = IS_PROD
  ? 'https://wx.yimaitongdao.com'
  : 'https://test-wx.yimaitongdao.com'
export const OSS_STATIC_HOST = 'https://oss.yimaitongdao.com'
export const YMTD_OSS_STATIC_HOST = "https://kr-ymtd.oss-cn-beijing.aliyuncs.com"

export const STATIC_MP_IMAGE_HOST = STATIC_HOST + '/geebox/default/'

// 运营后台 URL
export const OPERATION_HOST = IS_PROD
  ? 'https://operation.yimaitongdao.com'
  : 'https://test-operation.yimaitongdao.com'

// MAI websocket域名
export const MAI_SOCKET_HOST = IS_PROD
  ? 'wss://api.yimaitongdao.com/ymtd-capp/conversation'
  : 'wss://test-api.yimaitongdao.com/ymtd-capp/conversation'

// nps问卷
export const NPS_ID = 'f517d30cd618e731'

// 客服电话
export const YMTD_PHONE = '0512-62626030'

// 融云通讯 App Key
export const RONGCLOUD_APP_KEY = IS_PROD ? '8brlm7uf8ov93' : '8luwapkv86gol'

// 订阅职位关注公众号页面
export const SUBSCRIBE_PAGE_URL = IS_PROD
  ? 'https://mp.weixin.qq.com/s/T-HKgeWmaW77g-PAMt62lg'
  : 'https://mp.weixin.qq.com/s/cYXjbg_nhukRT9oEr5-3Wg'

export const HR_SUBSCRIBE_PAGE_URL = IS_PROD
  ? 'https://mp.weixin.qq.com/s?__biz=MzU1MzE3MzMyMA==&mid=2247494214&idx=3&sn=526b73cbb56bd7417dd22618569b26b0&chksm=fbf44261cc83cb7710a28b1d01bcd4070ebd5129e0471cf298e9935fe70ed893480654d602dc&token=2001504121&lang=zh_CN#rd'
  : 'https://mp.weixin.qq.com/s?__biz=MzU4MDkwMjg5OA==&mid=2247483675&idx=1&sn=d3492abdeff2bfeeb843a739e527c8c7&chksm=fd4e8b86ca39029087064e78fc6da59942b991bac8639a4ba17f019017a0dd1d472025b38a91#rd'

// 小程序订阅消息模板 ID
// 【已停用】原测试环境即派测试小程序模板 ID：UgNc47Hcngw8ZQAvuujKyALxGfavffPhh8X7oN2EUHY
export const SUBSCRIBE_TEMPLATE_ID = IS_PROD
  ? 'rtLkUmoiO-u5Jx34sFUAlNyex9ycYTcc5ZlRCBI2gOw'
  : '2mSYFbZIzFz8yF1WJyzv2Ax_vAUANe_AAzwnHKVzgNk'

// 小程序未读消息提醒模板 ID
export const SUBSCRIBE_CHAT_MESSAGE_TEMPLATE_ID = IS_PROD
  ? 'jhZNcIqaUvCXL6AOaPl-6zaRdBXOimdLHUvMyRhbM44'
  : 'OitZjAq3jZMHoXeHNFUiAhYxHAJxPHvl-xOS4y6aH2U'

// 小程序上传简历文件 webview 部署地址
export const UPLOAD_RESUME_URL = IS_PROD
  ? 'https://h5.yimaitongdao.com/mp-upload-resume/index.html'
  : 'https://test-h5.yimaitongdao.com/mp-upload-resume/index.html'

// 简历置顶协议h5
export const RESUME_STICKY_AGREEMENT_URL = IS_PROD
  ? 'https://h5.yimaitongdao.com/agreement/resumeSticky.html'
  : 'https://test-h5.yimaitongdao.com/agreement/resumeSticky.html'

export const HEWA_TOC_APPID = IS_PROD 
  ? 'wxd59f69ee89e707b6'
  : 'wx805e87f3cce567d4'

// 简历置顶服务效果h5
export const RESUME_STICKY_SERVICE_URL = IS_PROD
  ? 'https://h5.yimaitongdao.com/resumeSticky/service'
  : 'https://test-h5.yimaitongdao.com/resumeSticky/service'

// 小程序上传附件简历 webview 部署地址
export const UPLOAD_RESUME_ATTACHMENT_URL = IS_PROD
  ? 'https://h5.yimaitongdao.com/mp-upload-resume-attachment/index.html'
  : 'https://test-h5.yimaitongdao.com/mp-upload-resume-attachment/index.html'

// HR 后台跳转地址（我是 HR，我要招人）
export const HR_HOST = IS_PROD
  ? 'https://hr.yimaitongdao.com/m/login/register'
  : 'https://test-hr.yimaitongdao.com/m/login/register'

export const HR_BASE_HOST = IS_PROD
  ? 'https://hr.yimaitongdao.com'
  : 'https://test-hr.yimaitongdao.com'

// 品牌雇主活动地址
export const BEST_EMPLOYE_LINK = HR_BASE_HOST + '/brandRecruitmentSeason/vote/c-mini'

// 加入社群跳转地址
export const JOIN_HOST = 'https://mp.weixin.qq.com/s/3KMbXA1yriVH6BmOH81ioA'

// 小程序分享封面图
export const SHARE_APP_IMAGE = 'https://wx.yimaitongdao.com/geebox/images/miniProgram_banner_01.jpg'

// 默认头像（男）
export const DEFAULT_MALE_AVATAR = STATIC_MP_IMAGE_HOST + 'avatar/avatar-male-1-c.png'

// 默认头像（女）
export const DEFAULT_FEMALE_AVATAR = STATIC_MP_IMAGE_HOST + 'avatar/avatar-female-1-c.png'

// PC 端创建简历时扫码登录地址
export const CREATE_RESUME_SCAN_QECODE = IS_PROD
  ? 'cv.yimaitongdao.com'
  : 'test-cv.yimaitongdao.com'

// 公司名字
export const APP_COMPANY_NAME = '科锐数字科技(苏州)有限公司'

// 公司名字缩写
export const APP_COMPANY_SHORT_NAME = '科锐数字科技'

// 项目名
export const APP_PROJECT_NAME = '医脉同道'

// 电子营业许可证图片 url
export const EB_LICENSE_IMAGE_URL =
  'https://www.yimaitongdao.com/geebox/default/ymtd_business_license.jpg'

// 人力资源许可证图片 url
export const HR_LICENSE_IMAGE_URL =
  'https://www.yimaitongdao.com/geebox/default/ymtd_operating_license.jpg'

// 默认分页大小
export const APP_DEF_PAGE_SIZE = 10

// 完成简历的事件 key
export const COMPLETE_RESUME_EVENT_KEY = 'apply-job-complete-resume'

// 允许上传的简历文件格式
export const ALLOW_RESUME_FILE_TYPE = ['doc', 'docx', 'pdf', 'png', 'jpg', 'jpeg']

// 允许上传的附件简历格式
export const ALLOW_RESUME_ATTACHMENT_TYPE = ['doc', 'docx', 'pdf', 'png', 'jpg', 'jpeg']

// 允许上传的头像文件格式
export const ALLOW_AVATAR_FILE_TYPE = ['jpg', 'png', 'jpeg', 'bmp', 'gif']

// 职位搜索地址 KEY
export const LOCATION_STORAGE_KEY = 'com.ymtd.m.job_search_location'

// 职位搜索地址的修改时间key
export const LOCATION_STORAGE_KEY_CHANGE_DATE = 'com.ymtd.m.job_search_location_change_date'

// OpenID 存储 KEY
export const APP_OPENID_KEY = 'com.ymtd.m.auth.openid'

// token 字段存储 KEY
export const APP_TOKEN_FLAG = 'com.ymtd.m.auth.token'

// 是否登录态失效的老用户 字段存储 KEY
export const APP_IS_OLD_USER = 'com.ymtd.m.isOldUser'

// 融云 token 字段存储 KEY
export const IM_TOKEN_FLAG = 'com.ymtd.m.auth.imtoken'

// 首次启动小程序延迟初始化融云存储 KEY
export const IM_FIRST_LAUNCH_KEY = 'com.ymtd.m.im.first_launch'

// 历史搜索记录存储 KEY
export const SEARCH_HISTORY_STORAGE_KEY = 'com.ymtd.m.job.search_history'

// 新登录求职意向
export const NEW_LOGIN_INTENT_STORAGE_KEY = 'com.ymtd.m.new_login_intent_v1'

// 新登录弹窗点击接受
export const NEW_LOGIN_POPUP_APPLY = 'com.ymtd.m.new_login_apply'

// 上次提醒订阅 IM 通知时间存储 KEY
export const IM_LAST_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY = 'com.ymtd.m.im.last_notice_subscribe_time'

// 全屏 popup 营销弹窗存储 KEY
export const FULLSCREEN_OPEN_TIMES = 'com.ymtd.m.record.full_screen_popup'

// 下半部 popup 营销弹窗存储 KEY
export const FIXEDBOTTOM_OPEN_TIMES = 'com.ymtd.m.record.fixed_bottom_popup'

// 添加小程序营销弹窗存储 KEY
export const ADD_FAVORITE_OPEN_TIMES = 'com.ymtd.m.record.add_favorite_popup'

// 页面指引弹窗 KEY
export const GUIDE_OPEN_TIMES = 'com.ymtd.m.record.guide_popup'

// 抽奖活动弹窗key
export const LUCKYDRAW_OPEN_TIMES = 'com.ymtd.m.record.luckyDraw_popup'

export const EMPLOYER_OPEN_TIMES = 'com.ymtd.m.best_employer_popup'

// 简历置顶弹窗key
export const RESUME_SET_TOP_OPEN_TIMES = 'com.ymtd.m.resume_set_top_popup'

// 用户分享微信个人信息存储 KEY
export const SHARE_USER_INFO = 'com.ymtd.m.share.user_info'

// 用户简历信息存储 KEY
export const PROFILE = 'com.ymtd.m.profile'

// 用户订阅状态存储 KEY
export const SUBSCRIBE = 'com.ymtd.m.subscribe'

// 用户个性化推荐开启状态
export const IS_JD_RECOMMAND = 'com.ymtd.m.is_jd_recommand'

// 是否有职位意向
export const IS_INTENT = 'com.ymtd.m.is_intent'

// 是否是新用户
export const IS_IMPORTANT_USERINFO = 'com.ymtd.m.is_important_userinfo'

// 职位简历不再提醒补全存储 KEY
export const JOB_CHAT_RESUME_NOMORE_TIPS = 'com.ymtd.m.cache.record_tips'

// B 端首页网址
export const YMTD_HR_URL = 'https://hr.yimaitongdao.com'

// 活动用
export const HAVEDRAW = 'com.ymtd.m.cache.HaveDraw'

// 上次关闭提醒订阅通知时间存储 KEY
export const LAST_CLOSE_NOTICE_SUBSCRIBE_TIME_STORAGE_KEY =
  'com.ymtd.m.last_close_notice_subscribe_time'

// 刷新求职意向列表
export const REFRESH_INTENTS_LIST = 'com.ymtd.m.cache.refresh_intents_list'

// 每日推荐职位弹窗存储 KEY
export const QUALITY_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY =
  'com.ymtd.m.quality_postition_popup_last_show_time'

// 每日相似职位弹窗存储 KEY
export const SIMILAR_POSITION_POPUP_LAST_SHOW_TIME_STORAGE_KEY =
  'com.ymtd.m.similar_postition_popup_last_show_time'

// 仅开聊二次弹窗选项存储 KEY
export const CHAT_CONFIRM_POPUP_CHOOSE_STORAGE_KEY = 'com.ymtd.m.chat_confirm_popup_choose'

// 红包登录弹窗弹出
export const OPEN_REDPACKET_POPUP = 'com.ymtd.m.cache.open_redPacket_popup'

// IM 招呼语设置 tips 是否已展示过
export const IM_GREETING_WORDS_TIPS_SHOW = 'com.ymtd.m.im.greeting_words_tips_show'

// IM 招呼语提示弹窗是否已展示过
export const IM_GREETING_WORDS_MODAL_SHOW = 'com.ymtd.m.im.greeting_words_modal_show'

// IM 常用语 tips 是否已展示过
export const IM_COMMONLY_WORDS_TIPS_SHOW = 'com.ymtd.m.im.commonly_words_tips_show'
// IM 交换微信tips
export const IM_EXCHANGE_WECHAT_TIPS_SHOW = 'com.ymtd.m.im.exchange_wechat_tips_show'

// IM 直接发送简历文件是否二次确认
export const IM_SEND_PROFILE_FILE_CONFIRM = 'com.ymtd.m.im.send_profile_file_confirm'

// 广告弹窗弹出时间
export const ADS_POPUP_DATE = 'com.ymtd.m.ads_popup_date'
// 互动tab 首位id
export const IM_INTERACT_IDS = 'com.ymtd.m.im.interact.ids'

// 打开新增微信弹窗
export const OPEN_ADD_WECHAT_MODAL = 'OPEN_ADD_WECHAT_MODAL'
