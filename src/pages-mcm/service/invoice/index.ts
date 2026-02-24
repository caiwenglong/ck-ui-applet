import { http } from '@/http/http'

/** 保存发票信息 */
export function mcmInvoiceSave(customerId: string | number, data: any) {
  return http<any>({
    url: `/mcm/customer/${customerId}/account`,
    method: 'POST',
    data,
  })
}

/** 更新发票信息 */
export function mcmInvoiceUpdate(data: any) {
  return http<any>({
    url: `/mcm/customer/account`,
    method: 'PUT',
    data,
  })
}

/** 获取发票信息详情 */
export function mcmInvoiceDetail(id: string | number) {
  return http<any>({
    url: `/mcm/customer/subsidiary/account/${id}`,
    method: 'GET',
  })
}

/** 删除发票信息 */
export function mcmInvoiceDelete(id: string | number) {
  return http<any>({
    url: `/mcm/customer/account/${id}`,
    method: 'DELETE',
  })
}

/** 获取客户发票信息列表 */
export function mcmInvoiceList(customerId: string | number) {
  return http<any>({
    url: `/mcm/customer/${customerId}/account`,
    method: 'GET',
  })
}
