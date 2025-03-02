import { useEffect, useState } from 'react'

import appStore from '@/store'

/** 打开问卷星钓鱼问卷页 */
export function useTryOpenWJXMp() {
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    setIsNewUser(!Boolean(appStore.getState().resume))
  }, [])

  async function tryOpenWJXMp() {
    const userPhone = appStore.getState().user?.phone || '~'

    if (isNewUser && isTargetUser(userPhone)) {
      // @ts-ignore
      return wx.openEmbeddedMiniProgram({
        appId: 'wxebadf544ddae62cb',
        path: 'pages/survey/index?sid=10662078&hash=b7ac&navigateBackMiniProgram=true',
      })
    }

    return Promise.resolve(undefined)
  }

  return tryOpenWJXMp
}

function isTargetUser(phone?: string): boolean {
  const phoneList: string[] = [
    '15590501213',
    '18600470530',
    '15652256000',
    '15076607652',
    '17703165224',
    '18373316013',
    '15822516131',
    '15699300170',
    '17833137989',
    '13522847830',
    '13370116813',
    '13521485944',
    '18534750957',
    '13351511316',
    '15032735023',
    '13716336388',
    '17311863520',
    '13180122825',
    '13313368817',
    '18689058870',
    '13911378631',
    '18611093575',
    '13368609981',
    '15194954431',
    '15612420221',
    '15611197187',
    '18210363898',
    '18813047207',
    '19935154983',
    '17319178845',
    '17600235362',
    '13520893968',
    '18513571006',
    '15120063882',
    '18600022643',
    '13019460083',
    '17611271205',
    '13810888861',
    '15655520132',
    '17733848029',
    '13623648348',
    '18660252373',
    '18642851258',
    '15025136458',
    '17611076609',
    '13460038603',
    '18311159906',
    '15300356185',
    '15101106345',
    '13521270627',
    '15142152829',
    '18846422643',
    '18612353188',
    '15010871626',
    '18690287770',
    '17813180668',
    '13716670609',
    '13923413165',
    '17611029879',
    '15240451227',
    '13718169429',
    '13964240631',
    '15358913015',
    '18852467791',
    '13366689913',
    '15615860712',
    '13331090263',
    '13311558672',
    '15665887338',
    '15255606357',
    '17858287360',
    '15556206022',
    '18801498842',
    '15210245394',
    '15893144553',
    '16608554532',
    '18326687322',
    '18195146850',
    '18353997927',
    '18795995261',
    '13771305691',
    '13233392761',
    '18135854258',
    '13811267314',
    '13537773252',
    '15290506391',
    '15071797770',
    '15025136458',
    '15562674941',
    '15847466214',
    '18842335222',
    '19931309869',
    '13889420447',
    '17836201142',
    '13847689789',
    '18698459838',
    '15817457487',
    '13651344870',
    '18301190167',
    '18234107392',
    '13661123848',
    '18703402780',
    '13844229411',
    '13269582669',
    '15966647800',
    '18888252221',
    '18513602688',
    '18322458641',
    '15194603992',
    '18871119023',
    '13949910033',
    '19902171282',
    '15031622008',
    '15643642020',
    '18574138298',
    '13552658804',
    '18808141280',
    '17600930201',
    '18700181669',
    '13933027605',
    '18364167283',
    '18614262025',
    '18211138575',
    '13716484048',
    '13241206240',
    '18801230105',
    '13786134648',
    '18871119023',
    '13661314310',
    '18684225521',
    '17759188757',
    '13813667922',
    '13916260676',
    '13716907506',
    '13681236887',
    '18406582700',
    '15571452139',
    '19557000630',
    '13916497413',
    '13948374214',
    '13585802093',
    '18868003776',
    '13439519624',
    '15249553346',
    // 内部人员手机号，方便测试
    '13213210009',
    '13145051534',
    '18612929509',
    '18362890083',

    '18616718502',
    // '13585367159',
  ]

  return Boolean(phone && phoneList.includes(phone || '~'))
}
