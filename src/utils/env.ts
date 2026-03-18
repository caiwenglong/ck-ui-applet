/**
 * 运行环境类型
 * - miniprogram: 微信小程序
 * - wecom-h5: 企业微信 H5
 * - h5: 普通 H5（浏览器）
 */
export type RunEnv = 'miniprogram' | 'wecom-h5' | 'h5'

/**
 * 获取当前运行环境
 * @returns 当前环境：miniprogram | wecom-h5 | h5
 */
export function getRunEnv(): RunEnv {
  try {
    const sysInfo = uni.getSystemInfoSync() as { uniPlatform?: string, platform?: string }
    const platform = sysInfo.uniPlatform ?? sysInfo.platform ?? ''

    // 微信小程序
    if (platform === 'mp-weixin') {
      return 'miniprogram'
    }

    // H5 环境（含微信内置浏览器、企业微信内置浏览器等）
    if (platform === 'web' || (typeof window !== 'undefined' && window.navigator)) {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
      // 企业微信内置浏览器：UA 含 wxwork，或已注入企业微信 JSSDK 的 wx.qy
      const hasWxwork = /wxwork/i.test(ua)
      const hasWxQy = typeof wx !== 'undefined' && !!(wx as unknown as { qy?: unknown }).qy
      if (hasWxwork || hasWxQy) {
        return 'wecom-h5'
      }
      return 'h5'
    }

    return 'h5'
  }
  catch {
    return 'h5'
  }
}

/** 是否为微信小程序环境 */
export function isMiniprogram(): boolean {
  return getRunEnv() === 'miniprogram'
}

/** 是否为企业微信 H5 环境 */
export function isWecomH5(): boolean {
  return getRunEnv() === 'wecom-h5'
}

/** 是否为普通 H5 环境 */
export function isH5(): boolean {
  return getRunEnv() === 'h5'
}
