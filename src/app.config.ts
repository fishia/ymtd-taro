import { Config } from '@tarojs/taro'

const pageConfig: Config = {
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '医脉同道',
  },
  debug: process.env.ENV === 'development',
  pages: [
    'weapp/pages/job/index',
    'weapp/pages/discover/index',
    'weapp/pages/message/index',
    'weapp/pages/my/index',
  ],
  subPackages: [
    {
      root: 'weapp/general/',
      pages: [
        'error/index',
        'location/index',
        'job-categories/index',
        'webview/index',
        'login/index',
        'protocol/index',
        'new-login-guide/index',
        'city-filter/index',
        'add-wechat-guide/index',
        'infoStation/index',
      ],
    },
    {
      root: 'weapp/job/',
      pages: [
        'job-detail/index',
        'job-search/index',
        'company-index/index',
        'job-zones/index',
        'job-batch-share/index',
        'hr-job/index',
        'job-choiceness/index',
      ],
    },
    {
      root: 'weapp/resume/',
      pages: [
        'index/index',
        'resume-step/index',
        'longtext-input/index',
        'edit-basic-info/index',
        'edit-intent-info/index',
        'edit-edu-exp/index',
        'edit-job-exp/index',
        'edit-proj-exp/index',
        'create-resume/index',
        'create-scan-qrcode/index',
        'complete-resume/index',
        'resume-competition/index',
        'job-category/index',
        'edit-keywords/index',
        'input-autofill/index',
        'intent-info-list/index',
        'upload-webview/index',
        'upload-resume-file/index',
        'app-upload-resume-file/index',
        'app-upload-resume/index',
        'inputText/index',
      ],
    },
    {
      root: 'weapp/message/',
      pages: [
        'chat/index',
        'commonly-word/index',
        'greeting-word/index',
        'text-input/index',
        'look-me/index',
      ],
    },
    {
      root: 'weapp/my/',
      pages: [
        'record/index',
        'favorite/index',
        'cooperation/index',
        'invitation/index',
        'privacy/index',
        'about/index',
        'shielding_company/index',
        'add_shielding_company/index',
        'award/index',
        'login_to_phone/index',
      ],
      // @ts-ignore
      plugins: {
        AliyunCaptcha: {
          version: "2.0.0",
          provider: "wxbe275ff84246f1a4"
        }
      }
    },
    {
      root: 'weapp/discover/',
      pages: ['discover-detail/index'],
    },
    {
      root: 'weapp/active/',
      pages: [
        'index',
        'position-recommendation/index',
        'twoWaySelectionMeeting/index',
        'twoWaySelectionMeetingDetail/index',
        'preachMeeting/index',
        'preachMeetingDetail/index',
        'resume-sticky/index',
        'static-carousel/index',
        'hewa/index',
      ],
    },
    {
      root: 'weapp/landing/',
      pages: ['hr/index', 'success/index', 'hr/sealing/index'],
    },
    {
      root: 'pages/',
      pages: ['position', 'positionTypeList', 'article'],
    },
    {
      root: 'weapp/MAI/',
      pages: ['chat/index', 'chatCard/index'],
    },
    {
      root: 'packageA/',
      pages: [
        'aboutUs',
        'activePage',
        'articleDetail',
        'comDesc',
        'deliverRecord',
        'posDesc',
        'relatedPos',
        'resume-competition',
        'resumePk',
      ],
    },
  ],
  preloadRule: {
    'weapp/pages/job/index': {
      network: 'all',
      packages: ['weapp/job/', 'weapp/my/', 'weapp/discover/', 'weapp/general/', 'weapp/message/'],
    },
  },
  tabBar: {
    custom: true,
    color: '#595959',
    selectedColor: '#436EF3',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'weapp/pages/job/index',
        text: '职位',
        iconPath: 'assets/imgs/weappTabBar/job.png',
        selectedIconPath: 'assets/imgs/weappTabBar/job-selected.png',
      },
      {
        pagePath: 'weapp/pages/discover/index',
        text: '发现',
        iconPath: 'assets/imgs/weappTabBar/discover.png',
        selectedIconPath: 'assets/imgs/weappTabBar/discover-selected.png',
      },
      {
        pagePath: 'weapp/pages/message/index',
        text: '消息',
        iconPath: 'assets/imgs/weappTabBar/message.png',
        selectedIconPath: 'assets/imgs/weappTabBar/message-selected.png',
      },
      {
        pagePath: 'weapp/pages/my/index',
        text: '我的',
        iconPath: 'assets/imgs/weappTabBar/my.png',
        selectedIconPath: 'assets/imgs/weappTabBar/my-selected.png',
      },
    ],
  },
  permission: {
    'scope.userLocation': { desc: '你的位置信息将用于为你推荐附近职位' },
  },
  // @ts-ignore
  requiredPrivateInfos: ['getLocation'],
  // @ts-ignore
  embeddedAppIdList: ['wxe5f52902cf4de896']
}

export default pageConfig as any
