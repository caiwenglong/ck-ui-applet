import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { useDictStore } from '@/store'

/**
 * @description    路径拼接
 * @param  { string[] } paths
 * @return { string }
 *
 */
export function joinPath(...paths: string[]): string {
  return paths.filter(Boolean).join('/') || '-'
}

/**
 * @description  字典翻译
 * @param  { string } dictType 字典类型
 * @param  { string | number } value 字典值
 *
 */
export function dict(dictType: string, value: string | number) {
  const { dictList } = storeToRefs(useDictStore())
  const i18nDict = dictList.value[dictType].find((item: any) => item.dictValue === value)
  if (i18nDict) {
    const i18nList = i18nDict.i18nList
    return i18nList.find((item: any) => item.language === 'zh-CN')?.fieldValue || value || '-'
  }
  else {
    return value || '-'
  }
}

/**
 * @param input 输入值
 * @param isNegative 是否允许负数
 */
export function isNumeric(input: any, isNegative: boolean = false): boolean {
  // 使用正则表达式检查是否是纯数字，可以包含小数点
  // return /^[0-9]+(\.[0-9]+)?$/.test(input)
  return isNegative ? /^-?\d+(?:\.\d*)?$/.test(input) : /^\d+(?:\.\d+)?$/.test(input)
}

/**
 * @description  金额格式化
 * @param  { string | number } amount 金额
 * @param  { number } number 保留位数
 * @return { string }
 */

export function moneyFormat(amount: any, number: number = 2): string {
  if (amount === 0) {
    return Number.parseFloat('0.0000').toFixed(number)
  }
  // 为负数
  let isNegative = false
  if (!amount) {
    // return '0.000' //改成两位为0.00
    return '-' // 改成两位为0.00
  }

  // 判断是否为负数
  if (amount < 0) {
    amount = amount * -1
    isNegative = true
  }
  else {
    isNegative = false
  }

  if (!isNumeric(amount)) {
    return ''
  }

  // 强制保留两位小数
  let f = Number.parseFloat(amount)
  if (Number.isNaN(f))
    return
  f = Math.round(amount * 10000) / 10000 // 改成两位为f = Math.round(amount * 100)/100
  let s = f.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length < rs + 1 + 4) {
    // 改成两位为while (s.length < (rs + 1) + 2)
    s += '0'
  }

  // 是否四舍五入number位小数
  s = roundAmount(Number.parseFloat(s), number)

  return isNegative ? `-${s}` : s
}

/**
 * @description  金额四舍五入
 * @param  { number } amount 金额
 * @param  { number } number 保留位数
 * @return { string }
 */
function roundAmount(amount: number, number: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: number,
    maximumFractionDigits: number,
  }).format(amount)
}

/**
 * @description 使用dayjs 计算两个时间相差多少天
 * @param  { string } startTime 开始时间
 * @param  { string } endTime 结束时间
 * @return { string }
 */
export function getTimeDiff(startTime: string, endTime: string): string {
  if (!startTime || !endTime)
    return '-'
  return `${dayjs(endTime).diff(dayjs(startTime), 'day') || '0'}天`
}

/**
 * @description 跳转路由
 * @param  { string } path 路由地址
 */
export function goRouter(path: string) {
  uni
    .navigateTo({
      url: path,
    })
    .then()
}
