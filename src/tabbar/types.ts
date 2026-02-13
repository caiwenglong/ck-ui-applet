import type { TabBar } from '@uni-helper/vite-plugin-uni-pages'
import type { UserRole } from '@/api/types/login'
import type { RemoveLeadingSlashFromUnion } from '@/typings'

/**
 * 原生 tabbar 的单个选项配置
 */
export type NativeTabBarItem = TabBar['list'][number] & {
  pagePath: RemoveLeadingSlashFromUnion<_LocationUrl>
}

/** badge 显示一个数字或 小红点 */
export type CustomTabBarItemBadge = number | 'dot'

/** 自定义 tabbar 的单个选项配置（基于 TDesign t-tab-bar-item） */
export interface CustomTabBarItem {
  /** tabbar 显示的文本 */
  text: string
  /** 页面路径，同时作为 t-tab-bar-item 的 value 标识符 */
  pagePath: RemoveLeadingSlashFromUnion<_LocationUrl>
  /** TDesign 图标名称（字符串）或图标配置对象（透传至 t-icon） */
  icon: string | Record<string, any>
  /** badge 显示一个数字或 小红点 */
  badge?: CustomTabBarItemBadge
  /** 角色权限控制：不写 → 所有用户可见；写了 → 匹配角色才可见 */
  roles?: UserRole[]
}
