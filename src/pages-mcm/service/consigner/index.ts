import { http } from '@/http/http'

/** 保存常用收发人 */
export function mcmConsignerSave(data: any) {
  return http<any>({
    url: `/mcm/customer/consigner`,
    method: 'POST',
    data,
  })
}

/** 更新常用收发人 */
export function mcmConsignerUpdate(data: any) {
  return http<any>({
    url: `/mcm/customer/consigner`,
    method: 'PUT',
    data,
  })
}

/** 获取常用收发人详情 */
export function mcmConsignerDetail(id: string | number) {
  return http<any>({
    url: `/mcm/customer/consigner/${id}`,
    method: 'GET',
  })
}

/** 删除常用收发人 */
export function mcmConsignerDelete(id: string | number) {
  return http<any>({
    url: `/mcm/customer/consigner/${id}`,
    method: 'DELETE',
  })
}

/** 获取客户常用收发人列表 */
export function mcmConsignerList(customerId: string | number, publicType: number = 0) {
  return http<any>({
    url: `/mcm/customer/consigner/list`,
    method: 'GET',
    query: {
      pageNum: -1,
      pageSize: -1,
      customerId,
      publicType,
    },
  })
}
