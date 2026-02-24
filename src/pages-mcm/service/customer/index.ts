import type { IPage } from '@/typings'
import { http } from '@/http/http'

/** 获取分页 */
export function mcmCustomerPageList(query: IPage<any>) {
  return http<any>({
    url: `/mcm/customer/pageList`,
    method: 'GET',
    query,
  })
}

/** 保存客户基本信息 */
export function mcmCustomerSave(data: any) {
  return http<any>({
    url: `/mcm/customer/basicInfo`,
    method: 'POST',
    data,
  })
}

/** 更新客户基本信息 */
export function mcmCustomerUpdate(data: any) {
  return http<any>({
    url: `/mcm/customer/basicInfo`,
    method: 'PUT',
    data,
  })
}

/** 获取客户基本信息详情 */
export function mcmCustomerDetail(id: string | number) {
  return http<any>({
    url: `/mcm/customer/basicInfo/${id}`,
    method: 'GET',
  })
}

/** 删除客户 */
export function mcmCustomerDelete(id: string | number) {
  return http<any>({
    url: `/mcm/customer/${id}`,
    method: 'DELETE',
  })
}
/** 获取联系人 */
export function mcmCustomerContactList(query: IPage<any>) {
  return http<any>({
    url: `/mcm/customer/contact/pageList`,
    method: 'GET',
    query,
  })
}

/** 根据客户ID获取联系人列表 */
export function mcmCustomerContactByCustomerId(customerId: string | number) {
  return http<any>({
    url: `/mcm/customer/${customerId}/contact`,
    method: 'GET',
  })
}

/** 获取公司人员列表 */
export function apiGetCompanyPersonList(query: IPage<any> = {
  pageSize: -1,
  pageNum: 0,
}) {
  return http<any>({
    url: `/system/user/list`,
    method: 'GET',
    query,
  })
}

/** 保存跟进 */
export function apiSaveTrack(data: any) {
  return http<any>({
    url: `/mcm/customer/track`,
    method: 'POST',
    data,
  })
}

/** 获取客户SOP列表 */
export function mcmCustomerSopList(customerId: string | number) {
  return http<any>({
    url: `/mcm/customer/${customerId}/sop`,
    method: 'GET',
  })
}

/** 保存客户SOP */
export function mcmCustomerSopSave(customerId: string | number, data: any) {
  return http<any>({
    url: `/mcm/customer/${customerId}/sop`,
    method: 'POST',
    data,
  })
}

/** 更新客户SOP */
export function mcmCustomerSopUpdate(data: any) {
  return http<any>({
    url: `/mcm/customer/sop`,
    method: 'PUT',
    data,
  })
}

/** 获取客户SOP详情 */
export function mcmCustomerSopDetail(id: string | number) {
  return http<any>({
    url: `/mcm/customer/subsidiary/sop/${id}`,
    method: 'GET',
  })
}

/** 删除客户SOP */
export function mcmCustomerSopDelete(id: string | number) {
  return http<any>({
    url: `/mcm/customer/sop/${id}`,
    method: 'DELETE',
  })
}

/** 获取客户跟进记录列表 */
export function mcmCustomerTrackList(query: IPage<any>) {
  return http<any>({
    url: `/mcm/customer/track/pageList`,
    method: 'GET',
    query,
  })
}

/** 回复跟进评论 */
export function mcmCustomerTrackComment(data: {
  customerTrackId: string | number
  commentContent: string
  pid?: string | number | null
}) {
  return http<any>({
    url: `/mcm/customer/track/comment`,
    method: 'POST',
    data,
  })
}

/** 获取部门树 */
export function apiGetDeptTree(parentId: string | number = 0) {
  return http<any>({
    url: `/system/dept/tree/${parentId}`,
    method: 'GET',
  })
}
