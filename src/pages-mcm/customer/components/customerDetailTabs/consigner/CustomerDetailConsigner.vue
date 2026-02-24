<!--
  * @description 客户详情 - 常用收发人（第二个 Tab）
  * 数据来源：统一使用列表接口 mcm/customer/consigner/list
-->
<template>
  <view class="consigner">
    <wd-message-box />
    <view v-if="consignerList.length" class="list">
      <view v-for="(item, idx) in consignerList" :key="item.id || idx" class="card">
        <view class="card-header">
          <view class="header-left">
            <!-- 删除按钮 -->
            <view class="remove-btn" @click.stop="handleRemove(item)">
              <wd-icon name="minus-circle-filled" size="22px" />
            </view>
            <text class="card-title">收发人{{ Number(idx) + 1 }}</text>
            <text v-if="isCommon(item)" class="tag">常用</text>
          </view>
          <!-- 编辑 -->
          <text class="edit-btn" @click="handleEdit(item)">编辑</text>
        </view>

        <view class="card-body">
          <view class="row">
            <text class="label">收发人信息</text>
            <text class="value">{{ getConsignerInfoText(item) }}</text>
          </view>
          <view class="row">
            <text class="label">收发人类型</text>
            <text class="value">{{ getConsignerTypeText(item) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="!isLoading" class="empty">
      <ck-status-tip image="content" tip="暂无常用收发人" />
    </view>

    <view v-if="isLoading" class="loading">
      加载中...
    </view>

    <view class="footer">
      <view class="footer-btn-wrapper">
        <wd-button size="medium" type="primary" plain block @click="handleAdd">
          添加
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { CustomerDetailData } from '@/pages-mcm/type/customer'
import { useMessage, useToast } from 'wot-design-uni'
import { mcmConsignerDelete, mcmConsignerList } from '@/pages-mcm/service/consigner'

interface ConsignerItem {
  id?: string | number
  // 后端可能会返回 1/'1'/true 等
  isCommonUse?: number | boolean | string
  isDefault?: number | boolean | string
  isCommon?: number | boolean | string
  common?: number | boolean | string
  default?: number | boolean | string
  // 可能的字段：地址/类型
  consignerInfo?: string
  consignerName?: string | null
  address?: string
  addressDetail?: string
  addressFull?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  detailAddress?: string
  consignerAddress?: string
  consigneeAddress?: string
  senderAddress?: string
  receiverAddress?: string
  consignerType?: string | number
  consignerTypeName?: string
  type?: string | number
  typeName?: string
  sendReceiveType?: string | number
  sendReceiveTypeName?: string
  [key: string]: any
}

const props = defineProps<{
  data: CustomerDetailData
}>()

const message = useMessage()
const { success: showSuccess, error: showError, loading: showLoading, close: closeToast } = useToast()

// 常用收发人列表数据
const consignerList = ref<ConsignerItem[]>([])
const isLoading = ref(false)

function isCommon(item: ConsignerItem) {
  // 后端示例字段：isCommonUse
  const v
    = item?.isCommonUse ?? item?.isDefault ?? item?.isCommon ?? item?.common ?? item?.default
  if (typeof v === 'boolean')
    return v
  return v === 1 || v === '1'
}

function getConsignerInfoText(item: ConsignerItem) {
  const direct
    = item?.consignerInfo
      || item?.addressFull
      || item?.address
      || item?.consignerAddress
      || item?.consigneeAddress
      || item?.senderAddress
      || item?.receiverAddress
      || item?.detailAddress
      || item?.addressDetail
  if (typeof direct === 'string' && direct.trim())
    return direct.trim()

  // 兜底：拼接省市区 + 详细地址
  const parts = [item?.provinceName, item?.cityName, item?.districtName, item?.detailAddress].filter(
    x => typeof x === 'string' && x.trim(),
  ) as string[]
  if (parts.length)
    return parts.join('')

  return '-'
}

function getConsignerTypeText(item: ConsignerItem) {
  const named = item?.consignerTypeName || item?.sendReceiveTypeName || item?.typeName
  if (typeof named === 'string' && named.trim())
    return named.trim()

  const raw = item?.consignerType ?? item?.sendReceiveType ?? item?.type
  if (raw === null || raw === undefined || raw === '')
    return '-'

  // 常见映射（兜底，不影响后端直出）
  const map: Record<string, string> = {
    // 你提供的示例：consignerType=1，截图展示为“发货人”
    1: '发货人',
    2: '收货人',
    sender: '发货人',
    receiver: '收货人',
    consigner: '发货人',
    consignee: '收货人',
  }
  const key = String(raw).trim()
  return map[key] || key
}

// 获取客户ID
const getCustomerId = () => String((props.data as any)?.id ?? '')

// 获取常用收发人列表
async function fetchConsignerList() {
  const customerId = getCustomerId()
  if (!customerId) {
    console.warn('缺少客户ID，无法获取常用收发人列表')
    return
  }

  isLoading.value = true
  try {
    const { data } = await mcmConsignerList(customerId, 0)
    // 处理返回的数据格式，可能是数组或对象包含list字段
    if (Array.isArray(data)) {
      consignerList.value = data
    }
    else if (data && Array.isArray(data.list)) {
      consignerList.value = data.list
    }
    else if (data && Array.isArray(data.records)) {
      consignerList.value = data.records
    }
    else if (data && typeof data === 'object') {
      // 如果返回的是单个对象，转为数组
      consignerList.value = [data]
    }
    else {
      consignerList.value = []
    }
  }
  catch (e) {
    console.error('获取常用收发人列表失败', e)
    showError({ msg: '获取常用收发人列表失败' })
    consignerList.value = []
  }
  finally {
    isLoading.value = false
  }
}

// 刷新常用收发人列表（供外部调用）
function refreshConsignerList() {
  fetchConsignerList()
}

// 监听刷新事件
function handleRefresh() {
  refreshConsignerList()
}

// 编辑常用收发人
function handleEdit(item: ConsignerItem) {
  uni.navigateTo({
    url: `/pages-mcm/customer/consigner/consignerAddOrUpdate?id=${item?.id ?? ''}&customerId=${getCustomerId()}`,
  })
}

// 新增常用收发人
function handleAdd() {
  uni.navigateTo({
    url: `/pages-mcm/customer/consigner/consignerAddOrUpdate?customerId=${getCustomerId()}`,
  })
}

// 删除常用收发人
function handleRemove(item: ConsignerItem) {
  console.log('点击删除按钮', item)

  if (!item?.id) {
    showError({ msg: '缺少常用收发人ID' })
    return
  }

  console.log('准备显示确认框')

  message
    .confirm({
      msg: '确定要删除该常用收发人吗？',
      title: '提示',
    })
    .then(() => {
      console.log('用户确认删除')
      // 确认后执行删除
      showLoading({ msg: '删除中...' })
      mcmConsignerDelete(item.id!)
        .then(() => {
          closeToast()
          showSuccess({ msg: '删除成功' })
          // 刷新常用收发人列表
          refreshConsignerList()
        })
        .catch((e) => {
          closeToast()
          console.error('删除常用收发人失败', e)
          showError({ msg: '删除失败' })
        })
    })
    .catch((err) => {
      // 用户取消删除，不做任何操作
      console.log('用户取消删除', err)
    })
}

// 生命周期
onMounted(() => {
  // 初始加载
  fetchConsignerList()
  // 监听刷新事件
  uni.$on('refreshConsignerList', handleRefresh)
})

onUnmounted(() => {
  // 清理事件监听
  uni.$off('refreshConsignerList', handleRefresh)
})
</script>

<style lang="scss" scoped>
.consigner {
  padding: 12rpx 0 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff4d4f;
}

.card-title {
  font-size: 28rpx;
  color: #1f1f1f;
  font-weight: 500;
}

.tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 999px;
  color: #2f6bff;
  background: rgba(47, 107, 255, 0.12);
}

.edit-btn {
  font-size: 28rpx;
  color: #2f6bff;
}

.card-body {
  padding: 0 16rpx 16rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
  padding: 12rpx 0;
  border-top: 1px solid #f2f2f2;
}

.label {
  flex: 0 0 auto;
  font-size: 26rpx;
  color: var(--wot-cell-title-color, #969799); // 使用全局 CSS 变量，灰色
}

.value {
  flex: 1 1 auto;
  text-align: right;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.85); // 黑色，跟 cell 一样
  word-break: break-all;
}

.empty {
  padding: 24rpx 0;
  color: #999;
  font-size: 28rpx;
  text-align: center;
}

.loading {
  padding: 24rpx 0;
  color: #999;
  font-size: 28rpx;
  text-align: center;
}

.footer {
  padding: 24rpx 0 8rpx;
}

.footer-btn-wrapper {
  width: 50%;
  margin: 0 auto;
}
</style>
