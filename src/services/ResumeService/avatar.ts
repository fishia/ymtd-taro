import { sample } from 'lodash'

import { SexType } from '@/def/user'

export const maleDefaultAvatar: string[] = [
  '/geebox/default/avatar/avatar-male-1-c.png',
  '/geebox/default/avatar/avatar-male-2-c.png',
]

export const femaleDefaultAvatar: string[] = [
  '/geebox/default/avatar/avatar-female-1-c.png',
  '/geebox/default/avatar/avatar-female-2-c.png',
]

export const allDefaultAvatars = [...maleDefaultAvatar, ...femaleDefaultAvatar]

export function getRandomMaleAvatar() {
  return sample(maleDefaultAvatar)!
}

export function getRandomFemaleAvatar() {
  return sample(femaleDefaultAvatar)!
}

export function getRandomAvatarBySex(sex: any) {
  return String(sex) === String(SexType.boy) ? getRandomMaleAvatar() : getRandomFemaleAvatar()
}

export function getDefaultAvatarBySex(sex: any) {
  return String(sex) === String(SexType.boy)
    ? '/geebox/default/avatar/avatar-male-1-c.png'
    : '/geebox/default/avatar/avatar-female-1-c.png'
}
