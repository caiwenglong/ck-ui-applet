// 全局要用的类型放到这里
/** 工具类型：删除字符串开头的第一个斜杠 */
export type RemoveLeadingSlash<S extends string> = S extends `/${infer Rest}` ? Rest : S

/** 工具类型：删除联合类型中每个字符串的第一个斜杠 */
export type RemoveLeadingSlashFromUnion<T extends string> = T extends any ? RemoveLeadingSlash<T> : never

// 通用分页返回参数
export interface IPageResult<T> {
  list: T[]
  total: number
}

// 分页类型
export interface IPage<T> {
  pageNum: number
  pageSize: number
}

interface IQyResData<T> {
  code: string
  errMsg: string
}

interface IResData<T> {
  code: number
  msg: string
  data: T
}

// uni.uploadFile文件上传参数
interface IUniUploadFileOptions {
  file?: File
  files?: UniApp.UploadFileOptionFiles[]
  filePath?: string
  name?: string
  formData?: any
}

interface IUserInfo {
  nickname?: string
  avatar?: string
  /** 微信的 openid，非微信没有这个字段 */
  openid?: string
  token?: string
}

interface IUserH5LoginForm {
  userName: string
  password: string
}

declare type Recordable<T = any> = Record<string, T>
