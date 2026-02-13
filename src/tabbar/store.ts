import type { CustomTabBarItem, CustomTabBarItemBadge } from './types'
import { computed, reactive } from 'vue'
import { useUserStore } from '@/store/user'

import { tabbarList as _tabbarList, selectedTabbarStrategy, TABBAR_STRATEGY_MAP } from './config'

/** tabbarList 里面的 path 从 pages.config.ts 得到 */
const baseTabbarList = reactive<CustomTabBarItem[]>(_tabbarList.map(item => ({
  ...item,
  pagePath: item.pagePath.startsWith('/') ? item.pagePath : `/${item.pagePath}`, // 统一成 '/' 开头的路径
})))

const userRoles = computed(() => {
  const userStore = useUserStore()
  const userInfo = userStore.userInfo.value
  if (Array.isArray(userInfo?.roles) && userInfo.roles.length > 0) {
    return userInfo.roles
  }
  if (userInfo?.role) {
    return [userInfo.role]
  }
  return []
})

const tabbarList = computed(() => {
  const roles = userRoles.value
  if (roles.length === 0) {
    return baseTabbarList.filter(item => !item.roles || item.roles.length === 0)
  }
  return baseTabbarList.filter(item => !item.roles || item.roles.length === 0 || item.roles.some(role => roles.includes(role)))
})

export function isPageTabbar(path: string) {
  if (selectedTabbarStrategy === TABBAR_STRATEGY_MAP.NO_TABBAR) {
    return false
  }
  const _path = path.split('?')[0]
  return tabbarList.value.some(item => item.pagePath === _path)
}

/**
 * 自定义 tabbar 的状态管理，原生 tabbar 无需关注本文件
 * 使用 pagePath 作为当前选中值（与 TDesign t-tab-bar 的 value 对齐）
 * 使用reactive简单状态，而不是 pinia 全局状态
 */
const tabbarStore = reactive({
  /** 当前选中的 tabbar pagePath */
  curValue: uni.getStorageSync('app-tabbar-value') || '/pages/index/index',
  /** 上一次选中的 tabbar pagePath */
  prevValue: uni.getStorageSync('app-tabbar-value') || '/pages/index/index',

  setCurValue(value: string) {
    this.curValue = value
    uni.setStorageSync('app-tabbar-value', value)
  },

  setTabbarItemBadge(pagePath: string, badge: CustomTabBarItemBadge) {
    const list = tabbarList.value
    const item = list.find(i => i.pagePath === pagePath)
    if (item) {
      item.badge = badge
    }
  },

  setAutoCurValue(path: string) {
    const list = tabbarList.value
    if (list.length === 0) {
      this.setCurValue(list[0]?.pagePath || '/pages/index/index')
      return
    }
    // '/' 当做首页
    if (path === '/') {
      this.setCurValue(list[0]?.pagePath || '/pages/index/index')
      return
    }
    const matched = list.find(item => item.pagePath === path)
    if (matched) {
      this.setCurValue(matched.pagePath)
    }
    else {
      const pagesPathList = getCurrentPages().map(item => item.route.startsWith('/') ? item.route : `/${item.route}`)
      const flag = list.some(item => pagesPathList.includes(item.pagePath))
      if (!flag) {
        this.setCurValue(list[0]?.pagePath || '/pages/index/index')
      }
    }
  },

  restorePrevValue() {
    if (this.prevValue === this.curValue)
      return
    this.setCurValue(this.prevValue)
    this.prevValue = uni.getStorageSync('app-tabbar-value') || '/pages/index/index'
  },
})

export { tabbarList, tabbarStore }
