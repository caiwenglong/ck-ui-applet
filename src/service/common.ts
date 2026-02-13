import { http } from '@/http/http'

export function getAction(url: string, query: Record<string, any> = {}) {
  return http({
    url,
    method: 'GET',
    query,
  })
}

/** 汇率 */
export const exchangeRatePageListByLatest = () => {
  return http<any>({
    url: `/bdm/exchangeRate/latest`,
    method: 'GET',
  })
}

// 获取字典数据
export const getDict = (dictType: string) => {
  return http<any>({
    url: `/system/dict/data/type/${dictType}`,
    method: 'GET',
  })
}

// 根据字典类型查询字典数据信息
export function apiGetDictByType(dictType) {
  return http({
    url: `/system/dict/data/type/${dictType}`,
    method: 'GET',
  })
}

// 获取所有字典
export const getAllDict = () => {
  return http<any>({
    url: `/system/dict/type/all`,
    method: 'GET',
  })
}

// 上传
export function saveFile(data) {
  return http({
    url: '/system/file/storage/save',
    method: 'POST',
    data,
  })
}

// 删除附件
export function apiDeleteFile(id) {
  return http({
    url: `/system/file/storage/${id}`,
    method: 'DELETE',
  })
}

/**
 * 获取机场列表
 */
export function apiGetAllAirport() {
  return http({
    url: '/bdm/airport/list',
    method: 'GET',
  })
}

/**
 * 获取客户列表
 */
export function apiGetCustomerList(params: any) {
  return http({
    url: '/mcm/customer/selectList',
    method: 'GET',
    // @ts-ignore
    params,
  })
}

// 省市区树
export const apiGetCountryRegionTree = () => {
  return http({
    url: '/bdm/country/region/tree',
    method: 'GET',
  })
}

/**
 * 流程
 * @param data
 */
export function completeByProcInstId(data: any) {
  return http({
    url: '/workflow/task/completeByProcInstId',
    method: 'POST',
    data: data,
  })
}
