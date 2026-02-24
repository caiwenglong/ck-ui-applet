<!--
  * @description mcm - 客户管理 - 新增、编辑
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="customer-form-box">
    <wd-toast />
    <!--  标题  -->
    <wd-navbar
      :bordered="false"
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      :title="isEdit ? '编辑客户' : '新增客户'"
      custom-style="background-color: #eae6ff !important;"
      @click-left="handleGeneralBack"
    />

    <!--  表单内容  -->
    <view class="form-content">
      <wd-form ref="formRef" :model="model" :rules="rules" label-width="120px">
        <wd-cell-group border title="基本信息">
          <template v-if="!isEdit" #value>
            <text class="import-btn" @click="handleGoImport">现有客户导入</text>
          </template>
          <view class="customer-name-field">
            <wd-input
              v-model="model.customerName"
              :rules="customerNameRules"
              clearable
              label="客户名称"
              label-width="120px"
              placeholder="请输入客户名称"
              prop="customerName"
              @input="onCustomerNameInput"
            />
            <view v-if="customerNameError" class="customer-name-error">
              {{ customerNameError }}
            </view>
          </view>
          <wd-cell center prop="customerType" title="客户类型" title-width="120px">
            <wd-radio-group v-model="model.customerType" inline shape="button">
              <wd-radio v-for="item in customerTypeList" :key="item.value" :value="item.value">
                {{ item.label }}
              </wd-radio>
            </wd-radio-group>
          </wd-cell>
          <wd-picker
            v-model="model.cooperateState"
            :columns="cooperateStateList"
            :rules="[{ required: true, message: '请选择合作状态' }]"
            label="合作状态"
            label-width="120px"
            placeholder="请选择合作状态"
            prop="cooperateState"
          />
          <wd-cell center prop="keyCustomerStar" title="大客户" title-width="120px">
            <wd-radio-group v-model="model.keyCustomerStar" inline shape="button">
              <wd-radio :value="1">
                是
              </wd-radio>
              <wd-radio :value="0">
                否
              </wd-radio>
            </wd-radio-group>
          </wd-cell>
          <wd-picker
            v-model="model.customerSource"
            :columns="customerSourceList"
            :rules="[{ required: true, message: '请选择客户来源' }]"
            label="客户来源"
            label-width="120px"
            placeholder="请选择客户来源"
            prop="customerSource"
            @change="handleCustomerSourceChange"
          />
          <wd-picker
            v-if="model.customerSource === customerSourceIntroduce"
            v-model="model.introducerName"
            :columns="customerList"
            :rules="[{ required: true, message: '请选择介绍人' }]"
            label="介绍人"
            label-width="120px"
            placeholder="请选择介绍人"
            prop="introducerName"
          />
          <wd-cell center prop="starLevel" title="客户星级" title-width="120px">
            <wd-rate v-model="model.starLevel" :count="5" />
          </wd-cell>
          <wd-input
            v-model="model.customerCity"
            clearable
            label="客户所在城市"
            label-width="120px"
            placeholder="请输入客户所在城市"
            prop="customerCity"
          />
          <wd-input
            v-model="model.nativePlace"
            clearable
            label="籍贯"
            label-width="120px"
            placeholder="请输入籍贯"
            prop="nativePlace"
          />
          <wd-input
            v-model="model.socialCreditCode"
            clearable
            label="社会信用代码"
            label-width="120px"
            placeholder="请输入社会信用代码"
            prop="socialCreditCode"
          />
        </wd-cell-group>

        <!--  客户表单标签页组件  -->
        <CustomerFormTabs v-model="formTabsData" :is-edit="isEdit" />
      </wd-form>

      <!--  底部按钮：编辑 = 取消 + 保存，新增 = 提交  -->
      <view class="footer">
        <template v-if="isEdit">
          <view class="footer-btns">
            <view class="footer-btn-item">
              <wd-button plain block size="large" type="primary" @click="handleGeneralBack">
                取消
              </wd-button>
            </view>
            <view class="footer-btn-item">
              <wd-button block size="large" type="primary" @click="handleSubmit">
                保存
              </wd-button>
            </view>
          </view>
        </template>
        <wd-button v-else block size="large" type="primary" @click="handleSubmit">
          提交
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { CustomerFormData } from '@/pages-mcm/type/customer'
import { useToast } from 'wot-design-uni'
import { httpGet } from '@/http/http'
import { apiGetDictByType } from '@/service/common'
import { handleGeneralBack } from '@/utils/function'
import { mcmCustomerDetail, mcmCustomerSave, mcmCustomerUpdate } from '../service/customer/index'
import CustomerFormTabs from './components/CustomerFormTabs.vue'

const { success: showSuccess, error: showError, loading: showLoading, close: closeLoading } = useToast()

// 路由参数
const routeOptions = ref<{ id?: string, importCustomerId?: string }>({})
const isEdit = computed(() => !!routeOptions.value.id)

// 客户来源 - 客户介绍的值（需要根据实际字典值调整）
const customerSourceIntroduce = ref('')

// 表单数据
const model = reactive({
  customerName: '',
  customerType: 1, // 1-企业 2-个人
  cooperateState: '',
  keyCustomerStar: 0, // 0-否 1-是
  customerSource: '',
  introducerName: '',
  starLevel: 0,
  customerCity: '',
  nativePlace: '',
  socialCreditCode: '',
})

// 表单标签页数据
const formTabsData = ref<CustomerFormData>({
  contactList: [],
  // 业务信息字段
  goodsIds: '',
  goodsNames: '',
  fundingRequirements: '',
  annualScale: '',
  importCountry: '',
  importPort: '',
  importGoods: '',
  annualExportScale: '',
  exportCountry: '',
  exportPort: '',
  exportGoods: '',
  remark: '',
  // 负责人字段
  salesmanId: '',
  salesmanName: '',
  assistantIds: '',
})

// 字典数据
const customerTypeList = ref([] as any[])

const cooperateStateList = ref([])
const customerSourceList = ref([])
const customerList = ref([])

const formRef = ref()

// 客户名称重复校验：请求 id，用于忽略过期响应
let nameCheckRequestId = 0
// 客户名称防抖定时器
let customerNameCheckTimer: ReturnType<typeof setTimeout> | null = null
// 客户名称校验错误（持久化展示，避免焦点切到其他字段时提示被清掉）
const customerNameError = ref('')

/** 客户名称检查接口返回 */
interface CheckNameRes {
  exist: boolean
  isAllocated?: boolean | null
  salesmanName?: string | null
}

/**
 * 调用接口检查客户名称是否已存在（mcm/customer/checkName）
 * 使用 requestId 忽略过期响应，避免输入过快时旧接口返回导致误判
 * @param name 客户名称
 * @returns 无重复 resolve；重复则 reject 并带上提示文案
 */
function checkNameDuplicate(name: string): Promise<void> {
  const trimmed = (name || '').trim()
  if (!trimmed)
    return Promise.resolve()

  const currentId = ++nameCheckRequestId
  return new Promise((resolve, reject) => {
    httpGet<IResData<CheckNameRes>>(`/mcm/customer/checkName/${encodeURIComponent(trimmed)}`)
      .then((res) => {
        if (currentId !== nameCheckRequestId) {
          resolve()
          return
        }
        const data = res?.data
        if (!data?.exist) {
          resolve()
          return
        }
        // 已存在：根据 isAllocated 区分提示
        if (data.isAllocated === true) {
          const salesmanName = data.salesmanName ?? ''
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(`【客户名称】已存在，负责人：${salesmanName}`)
        }
        else {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(`【${trimmed}】已存在公海中，请与管理人员确认`)
        }
      })
      .catch((err) => {
        if (currentId !== nameCheckRequestId) {
          resolve()
          return
        }
        reject(err)
      })
  })
}

// 客户名称校验规则：必填；仅新增时做重复校验，编辑时不校验重复
const customerNameRules = computed(() => {
  const base = [{ required: true, message: '请填写客户名称' }]
  if (isEdit.value)
    return base
  return [
    ...base,
    {
      validator: (value: string) => {
        customerNameError.value = ''
        return checkNameDuplicate(value).catch((err: string) => {
          customerNameError.value = typeof err === 'string' ? err : (err as Error)?.message || '客户名称校验失败'
          return Promise.reject(err)
        })
      },
    },
  ]
})

// 客户名称输入防抖（1s）后触发单字段校验
function onCustomerNameInput() {
  if (customerNameCheckTimer)
    clearTimeout(customerNameCheckTimer)
  customerNameCheckTimer = setTimeout(() => {
    customerNameCheckTimer = null
    formRef.value?.validate?.('customerName')
  }, 1000)
}

// 表单验证规则（customerName 在新增时含重复校验，编辑时仅必填）
const rules = computed(() => ({
  customerName: customerNameRules.value,
  cooperateState: [{ required: true, message: '请选择合作状态' }],
  customerSource: [{ required: true, message: '请选择客户来源' }],
}))

// 获取客户类型列表
async function getCustomerTypeList() {
  try {
    const { data } = await apiGetDictByType('customer_type')
    customerTypeList.value = (data as any[]).map((item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }))
  }
  catch (e) {
    console.error('获取客户类型失败', e)
  }
}

// 获取合作状态列表
async function getCooperateStateList() {
  try {
    const { data } = await apiGetDictByType('cooperate_state')
    cooperateStateList.value = (data as any[]).map((item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }))
  }
  catch (e) {
    console.error('获取合作状态失败', e)
  }
}

// 获取客户来源列表
async function getCustomerSourceList() {
  try {
    const { data } = await apiGetDictByType('customer_source')
    customerSourceList.value = (data as any[]).map((item: any) => {
      // 查找"客户介绍"的值
      if (item.dictLabel?.includes('介绍') || item.dictLabel?.includes('客户介绍')) {
        customerSourceIntroduce.value = item.dictValue
      }
      return {
        label: item.dictLabel,
        value: item.dictValue,
      }
    })
  }
  catch (e) {
    console.error('获取客户来源失败', e)
  }
}

// 获取客户列表（用于介绍人选择）
async function getCustomerList() {
  try {
    const { data } = await httpGet<IResData<any>>('/mcm/customer/selectList')
    customerList.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      label: item.customerName || item.name,
      value: item.customerName || item.name,
    }))
  }
  catch (e) {
    console.error('获取客户列表失败', e)
  }
}

// 跳转现有客户导入页
function handleGoImport() {
  uni.navigateTo({
    url: '/pages-mcm/customer/customerImport?from=add',
  })
}

// 客户来源变化
function handleCustomerSourceChange() {
  if (model.customerSource !== customerSourceIntroduce.value) {
    model.introducerName = ''
  }
}

// 提交表单
async function handleSubmit() {
  try {
    // 先验证联系人列表（至少需要一个联系人）
    if (!formTabsData.value.contactList || formTabsData.value.contactList.length === 0) {
      showError({ msg: '请至少添加一个联系人' })
      return
    }

    // 验证联系人必填字段
    const invalidContact = formTabsData.value.contactList.find(
      (contact: any) => !contact.contactName || !contact.contactPhone,
    )
    if (invalidContact) {
      showError({ msg: '请完善联系人信息（联系人名称和电话为必填项）' })
      return
    }

    // 再验证表单
    const { valid } = await formRef.value?.validate()
    if (!valid) {
      return
    }

    // 如果客户来源是客户介绍，需要验证介绍人
    if (model.customerSource === customerSourceIntroduce.value && !model.introducerName) {
      showError({ msg: '请选择介绍人' })
      return
    }

    // 合并所有数据
    const submitData = {
      ...model,
      customerContactList: formTabsData.value.contactList,
      goodsIds: formTabsData.value.goodsIds,
      fundingRequirements: formTabsData.value.fundingRequirements,
      annualScale: formTabsData.value.annualScale,
      importCountry: formTabsData.value.importCountry,
      importPort: formTabsData.value.importPort,
      importGoods: formTabsData.value.importGoods,
      annualExportScale: formTabsData.value.annualExportScale,
      exportCountry: formTabsData.value.exportCountry,
      exportPort: formTabsData.value.exportPort,
      exportGoods: formTabsData.value.exportGoods,
      remark: formTabsData.value.remark,
      salesmanId: formTabsData.value.salesmanId,
      assistantIds: formTabsData.value.assistantIds,
    }

    // 调用保存API
    if (isEdit.value) {
      await mcmCustomerUpdate({ ...submitData, id: routeOptions.value.id })
      showSuccess({ msg: '编辑成功' })
      // 延迟关闭当前页面并跳转到详情页
      setTimeout(() => {
        // 使用 redirectTo 替换当前页面为详情页，实现关闭当前页面并跳转的效果
        uni.redirectTo({
          url: `/pages-mcm/customer/customerDetails?id=${routeOptions.value.id}`,
        })
      }, 1500)
    }
    else {
      const res = await mcmCustomerSave(submitData)
      showSuccess({ msg: '新增成功' })
      // 获取返回的客户ID
      const customerId = res?.data?.id || res?.data
      if (customerId) {
        // 延迟跳转到完成页面
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages-mcm/customer/customerSuccess?customerId=${customerId}`,
          })
        }, 1500)
      }
      else {
        // 如果没有返回客户ID，延迟返回上一页
        setTimeout(() => {
          handleGeneralBack()
        }, 1500)
      }
    }
  }
  catch (error: any) {
    console.error('提交失败', error)
    if (error?.errors) {
      // 表单验证错误
      return
    }
  }
}

// 根据详情数据填充表单（供编辑、导入共用）
function fillFormFromDetail(data: any, isImport = false) {
  // 导入模式下排除 id，确保新增时不会带入原客户 ID
  const { id, ...restData } = data
  Object.assign(model, isImport ? restData : data)

  // 填充表单标签页数据
  if (data.customerContactList && Array.isArray(data.customerContactList)) {
    // 导入模式下清除联系人的 id，作为新联系人创建
    formTabsData.value.contactList = isImport
      ? data.customerContactList.map(({ id, ...rest }: any) => rest)
      : data.customerContactList
  }
  // 填充业务信息字段
  formTabsData.value.goodsIds = data.goodsIds || ''
  formTabsData.value.goodsNames = data.goodsNames || ''
  formTabsData.value.fundingRequirements = data.fundingRequirements || ''
  formTabsData.value.annualScale = data.annualScale || ''
  formTabsData.value.importCountry = data.importCountry || ''
  formTabsData.value.importPort = data.importPort || ''
  formTabsData.value.importGoods = data.importGoods || ''
  formTabsData.value.annualExportScale = data.annualExportScale || ''
  formTabsData.value.exportCountry = data.exportCountry || ''
  formTabsData.value.exportPort = data.exportPort || ''
  formTabsData.value.exportGoods = data.exportGoods || ''
  formTabsData.value.remark = data.remark || ''
  // 填充负责人字段
  formTabsData.value.salesmanId = data.salesmanId || ''
  formTabsData.value.salesmanName = data.salesmanName || ''
  formTabsData.value.assistantIds = data.assistantIds || ''
}

// 获取客户详情并填充表单（编辑模式或导入模式）
async function getCustomerDetail() {
  const customerId = routeOptions.value.id || routeOptions.value.importCustomerId
  if (!customerId)
    return

  // 是否为导入模式（新增时导入现有客户数据）
  const isImport = !routeOptions.value.id && !!routeOptions.value.importCustomerId

  try {
    showLoading({ msg: '加载中...' })
    const { data } = await mcmCustomerDetail(customerId)
    fillFormFromDetail(data, isImport)
  }
  catch (e) {
    console.error('获取客户详情失败', e)
    showError({ msg: '获取客户详情失败' })
  }
  finally {
    closeLoading()
  }
}

// 页面加载时获取路由参数
onLoad((options) => {
  routeOptions.value = options || {}
})

// 初始化数据
onMounted(() => {
  getCustomerTypeList()
  getCooperateStateList()
  getCustomerSourceList()
  getCustomerList()
  // 编辑模式或从导入页返回时，获取客户详情并填充表单
  if (isEdit.value || routeOptions.value.importCustomerId) {
    getCustomerDetail()
  }
})
</script>

<style>
page {
  background: #eae6ff;
}
</style>

<style lang="scss" scoped>
.customer-form-box {
  min-height: 100vh;
  background: #eae6ff;
}

.form-content {
  padding: 20rpx 20rpx 100rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 54px);
}

.footer {
  position: fixed;
  bottom: 20rpx;
  left: 0;
  right: 0;
  padding: 20rpx;
  z-index: 2;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.footer-btns {
  display: flex;
  gap: 20rpx;
}

.footer-btns .footer-btn-item {
  flex: 1;
}

:deep(.wd-cell-group) {
  margin-bottom: 20rpx;
}

:deep(.wd-radio-group) {
  display: flex;
  gap: 20rpx;
}

.import-btn {
  font-size: 28rpx;
  color: #018d71;
  cursor: pointer;
}

/* 仅展示自定义错误，隐藏 wd-input 内置错误避免重复提示 */
.customer-name-field :deep(.wd-input__error-message) {
  display: none;
}

.customer-name-error {
  padding: 8rpx 0 16rpx 0;
  padding-left: 120px; /* 与 label-width 对齐 */
  font-size: 24rpx;
  color: #ee0a24;
  line-height: 1.4;
}
</style>
