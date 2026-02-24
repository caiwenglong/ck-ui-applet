// src/utils/oss.ts
import { compact, get, includes, isNumber, isString, map, toString } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'

const { userInfo } = storeToRefs(useUserStore())
export const OSS_BASE_URL = 'https://ckscm-dev.oss-cn-hangzhou.aliyuncs.com/ck-applet-ui/material/'

export function oss(path: string): string {
  return OSS_BASE_URL + path
}

/**
 * 判断是否空对象
 * @param obj
 * @returns {boolean}
 */
export function isEmptyObject(obj: object) {
  // 检查传入的参数是否为对象类型
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  // 获取对象的所有可枚举属性
  const keys = Object.keys(obj)

  // 如果属性数量为0，则是空对象
  return keys.length === 0
}

/**
 * @description 通用导航栏返回函数
 *
 */
export async function handleGeneralBack() {
  await uni.navigateBack()
}

/**
 * 获取拖车地址
 * @param item
 */
export function getFullAddress(item) {
  return (
    `${(item.deliveryCountryName || '')
    + (item.deliveryProvinceName || '')
    + (item.deliveryCityName || '')
    + (item.deliveryRegionName || '')
    + (item.deliveryAddress || '')
    }-->${
      (item.targetCountryName || '')
      + (item.targetProvinceName || '')
      + (item.targetCityName || '')
      + (item.targetRegionName || '')
      + (item.targetAddress || '')}`
  )
}

/**
 * @description 通过省市区地址返回正常地址
 * @param {string} country 国家
 * @param {string} province 省
 * @param {string} city 市
 * @param {string} region 区
 * @param {string} address 详细地址
 * @return {string} 返回结果
 */
export function showAddress(
  country: string,
  province: string,
  city: string,
  region: string = '',
  address: string = '',
) {
  if (!country)
    return '-'
  let value = country
  if (province) {
    value += ` - ${province}`
  }
  if (city) {
    value += ` - ${city}`
  }
  if (region) {
    value += ` - ${region}`
  }
  if (address) {
    value += ` - ${address}`
  }

  return value
}

export function transformDictI18n(dict: any) {
  const i18nList = dict.i18nList
  return i18nList.find((item: any) => item.language === 'zh-CN')?.fieldValue || '-'
}

/**
 * 获取集合中指定字段的值并且组成一个数组
 * @param collection
 * @param fields
 * @returns {Array|*}
 */
export function extractField(collection, fields) {
  if (!Array.isArray(fields)) {
    fields = [fields]
  }
  // 使用 _.map() 提取指定字段的数据
  return map(collection, (obj) => {
    // 提取字段数据
    return compact(map(fields, field => get(obj, field))).join('/')
  })
}

export function isAdmin() {
  return includes(userInfo.value.roles, 'admin')
}

/**
 * 判断当前用户
 * @param userId
 */
export function isCurrentUser(userId) {
  return userInfo.value.user.userId === userId || isAdmin()
}

export function hasPermission(value) {
  const all_permission = '*:*:*'
  const permissions = userInfo.value?.permissions

  if (!Array.isArray(value)) {
    value = [value]
  }

  if (value && Array.isArray(value) && value.length > 0) {
    const permissionFlag = value

    return permissions.some((permission) => {
      return all_permission === permission || permissionFlag.includes(permission)
    })
  }
  else {
    return false
  }
}

/**
 * 判断输入是否为有效的金额格式（禁止千分位分隔符）
 * @param {string|number} input - 输入值
 * @returns {boolean}
 */
export function isAmount(input) {
  // 类型检查
  if (!isString(input) && !isNumber(input))
    return false

  const str = toString(input).trim()

  // 核心规则：禁止千分位分隔符
  if (/,/.test(str))
    return false // 包含逗号直接判定无效[6,8](@ref)

  // 格式验证（非负、最多两位小数、整数部分无前导0）
  const reg = /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/
  return reg.test(str)
}
