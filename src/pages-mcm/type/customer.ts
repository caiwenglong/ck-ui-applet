/**
 * 客户相关类型定义
 */

/**
 * 联系人项类型（最基础类型）
 */
export interface ContactItem {
  contactName: string
  contactPhone: string
  post: string
  email: string
  wechat: string
  qq: string
  remark: string
}

/**
 * 业务信息类型（基础类型，字段为可选）
 */
export interface BusinessInfo {
  goodsIds?: string
  /** 主营品名（后端回显用，如 goodsNames） */
  goodsNames?: string
  fundingRequirements?: string
  annualScale?: string
  importCountry?: string
  importPort?: string
  importGoods?: string
  annualExportScale?: string
  exportCountry?: string
  exportPort?: string
  exportGoods?: string
  remark?: string
}

/**
 * 负责人信息类型（基础类型，字段为可选）
 */
export interface ChargePersonInfo {
  salesmanId?: string
  salesmanName?: string
  assistantIds?: string | string[]
}

/**
 * 客户表单数据类型（继承所有基础类型，并将部分字段设为必填）
 * 注意：在 TypeScript 中，子接口重新声明字段会覆盖父接口的定义
 */
export interface CustomerFormData extends BusinessInfo, ChargePersonInfo {
  contactList: ContactItem[]
  // 业务信息字段（覆盖父接口，设为必填）
  goodsIds: string
  fundingRequirements: string
  annualScale: string
  importCountry: string
  importPort: string
  importGoods: string
  annualExportScale: string
  exportCountry: string
  exportPort: string
  exportGoods: string
  remark: string
  // 负责人字段（覆盖父接口，设为必填）
  salesmanId: string
  assistantIds: string
}

/**
 * 客户详情数据类型（用于展示，字段为可选）
 */
export interface CustomerDetailData {
  id?: string | number
  customerName?: string
  customerType?: number // 1: 公司, 2: 个人
  keyCustomerStar?: boolean // VIP标识
  cooperateState?: string | number // 合作状态
  goodsNames?: string // 主营品名
  associatedCustomerName?: string // 关联客户名称
  customerSource?: string | number // 客户来源
  introducerCustomerName?: string // 介绍人名称
  introducerCustomerId?: string | number // 介绍人ID
  starLevel?: number // 客户星级 0-5
  customerCity?: string // 客户所在城市
  nativePlace?: string // 籍贯
  socialCreditCode?: string // 社会信用代码
  [key: string]: any
}
