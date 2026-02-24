<!--
  * @description 客户详情 - 客户SOP（第四个 Tab）
  * 数据来源：统一使用接口 mcm/customer/{客户id}/sop
-->
<template>
  <view class="sop">
    <wd-message-box />
    <view v-if="sopList.length" class="list">
      <view v-for="(item, idx) in sopList" :key="item.id || idx" class="card">
        <view class="card-header">
          <view class="header-left">
            <!-- 删除按钮 -->
            <view class="remove-btn" @click.stop="handleRemove(item)">
              <wd-icon name="minus-circle-filled" size="22px" />
            </view>
            <text class="card-title">{{ getSopTitle(item) }}</text>
          </view>
          <!-- 编辑 -->
          <text class="edit-btn" @click="handleEdit(item)">编辑</text>
        </view>

        <view class="card-body">
          <text class="content">{{ getSopValue(item) }}</text>
        </view>
      </view>
    </view>

    <view v-else-if="!isLoading" class="empty">
      <ck-status-tip image="content" tip="暂无客户SOP" />
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
import { mcmCustomerSopDelete, mcmCustomerSopList } from '@/pages-mcm/service/customer'
import { dict } from '@/pages-mcm/utils'

interface SopItem {
  id?: string | number
  sopType?: string | number
  sopTypeName?: string
  sopValue?: string
  [key: string]: any
}

const props = defineProps<{
  data: CustomerDetailData
}>()

const message = useMessage()
const { success: showSuccess, error: showError, loading: showLoading, close: closeToast } = useToast()

// 客户SOP列表数据
const sopList = ref<SopItem[]>([])
const isLoading = ref(false)

// 获取客户ID
const getCustomerId = () => String((props.data as any)?.id ?? '')

// 获取客户SOP列表
async function fetchSopList() {
  const customerId = getCustomerId()
  if (!customerId) {
    console.warn('缺少客户ID，无法获取客户SOP列表')
    return
  }

  isLoading.value = true
  try {
    const { data } = await mcmCustomerSopList(customerId)
    // 处理返回的数据格式，可能是数组或对象包含list字段
    if (Array.isArray(data)) {
      sopList.value = data
    }
    else if (data && Array.isArray(data.list)) {
      sopList.value = data.list
    }
    else if (data && Array.isArray(data.records)) {
      sopList.value = data.records
    }
    else if (data && typeof data === 'object') {
      // 如果返回的是单个对象，转为数组
      sopList.value = [data]
    }
    else {
      sopList.value = []
    }
  }
  catch (e) {
    console.error('获取客户SOP列表失败', e)
    showError({ msg: '获取客户SOP列表失败' })
    sopList.value = []
  }
  finally {
    isLoading.value = false
  }
}

// 刷新客户SOP列表（供外部调用）
function refreshSopList() {
  fetchSopList()
}

// 监听刷新事件
function handleRefresh() {
  refreshSopList()
}

function getSopTitle(item: SopItem) {
  if (typeof item?.sopTypeName === 'string' && item.sopTypeName.trim())
    return item.sopTypeName.trim()

  const raw = item?.sopType
  if (raw === null || raw === undefined || raw === '')
    return '客户SOP'

  // 字典翻译：字典 key 为 sop_type
  try {
    const v1 = dict('sop_type', raw)
    console.log(v1)
    console.log('------------------------------')

    if (v1 !== raw && v1 !== '-' && v1 !== '')
      return String(v1)

    // 兼容：后端可能返回 '1'，字典值为 1（或相反）
    if (typeof raw === 'string') {
      const n = Number(raw)
      if (!Number.isNaN(n)) {
        const v2 = dict('sop_type', n)
        if (v2 !== n && v2 !== '-' && v2 !== '')
          return String(v2)
      }
    }
    else if (typeof raw === 'number') {
      const v2 = dict('sop_type', String(raw))
      if (v2 !== String(raw) && v2 !== '-' && v2 !== '')
        return String(v2)
    }
  }
  catch (e) {
    // ignore，走兜底
  }

  const key = String(raw).trim()
  return key ? `SOP ${key}` : '客户SOP'
}

function getSopValue(item: SopItem) {
  const v = item?.sopValue
  return typeof v === 'string' && v.trim() ? v.trim() : '-'
}

// 编辑客户SOP
function handleEdit(item: SopItem) {
  uni.navigateTo({
    url: `/pages-mcm/customer/sop/sopAddOrUpdate?id=${item?.id ?? ''}&customerId=${getCustomerId()}`,
  })
}

// 新增客户SOP
function handleAdd() {
  uni.navigateTo({
    url: `/pages-mcm/customer/sop/sopAddOrUpdate?customerId=${getCustomerId()}`,
  })
}

// 删除客户SOP
function handleRemove(item: SopItem) {
  console.log('点击删除按钮', item)

  if (!item?.id) {
    showError({ msg: '缺少客户SOP ID' })
    return
  }

  console.log('准备显示确认框')

  message
    .confirm({
      msg: '确定要删除该客户SOP吗？',
      title: '提示',
    })
    .then(() => {
      console.log('用户确认删除')
      // 确认后执行删除
      showLoading({ msg: '删除中...' })
      mcmCustomerSopDelete(item.id!)
        .then(() => {
          closeToast()
          showSuccess({ msg: '删除成功' })
          // 刷新客户SOP列表
          refreshSopList()
        })
        .catch((e) => {
          closeToast()
          console.error('删除客户SOP失败', e)
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
  fetchSopList()
  // 监听刷新事件
  uni.$on('refreshSopList', handleRefresh)
})

onUnmounted(() => {
  // 清理事件监听
  uni.$off('refreshSopList', handleRefresh)
})
</script>

<style lang="scss" scoped>
.sop {
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

.edit-btn {
  font-size: 28rpx;
  color: #2f6bff;
}

.card-body {
  padding: 0 16rpx 16rpx;
}

.content {
  display: block;
  font-size: 26rpx;
  color: #1f1f1f;
  line-height: 38rpx;
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
