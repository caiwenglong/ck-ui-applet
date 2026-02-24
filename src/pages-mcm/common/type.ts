export interface ContactItem {
  id: number
  customerId: number
  customerName?: string // 接口可能需要关联查询，暂时预留
  contactName: string
  contactPhone: string
  email?: string
  wechat?: string
  qq?: string
  remark?: string
  post?: string
  isDefault?: number
  // Search unique fields
  type?: 'contact'
  [key: string]: any
}
