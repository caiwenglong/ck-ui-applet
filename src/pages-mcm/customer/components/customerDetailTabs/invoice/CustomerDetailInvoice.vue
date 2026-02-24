<!--
  * @description 客户详情 - 发票信息（第三个 Tab）
  * 数据来源：统一使用列表接口 mcm/customer/{customerId}/account
-->
<template>
  <view class="invoice">
    <wd-message-box />
    <view v-if="accountList.length" class="list">
      <view v-for="(item, idx) in accountList" :key="item.id || idx" class="card">
        <view class="card-header">
          <view class="header-left">
            <!-- 删除按钮 -->
            <view class="remove-btn" @click.stop="handleRemove(item)">
              <wd-icon name="minus-circle-filled" size="22px" />
            </view>
            <text class="card-title">发票抬头</text>
          </view>
          <!-- 编辑 -->
          <text class="edit-btn" @click="handleEdit(item)">编辑</text>
        </view>

        <wd-cell-group border>
          <wd-cell title="发票抬头" :value="item.accountUser || '-'" title-width="120px" />
          <wd-cell title="纳税人识别号" :value="item.taxCode || '-'" title-width="120px" />
          <wd-cell title="开户行" :value="item.bankName || '-'" title-width="120px" />
          <wd-cell title="账号" :value="item.accountNo || '-'" title-width="120px" />
          <wd-cell title="地址" :value="item.address || '-'" title-width="120px" />
          <wd-cell title="电话" :value="item.phone || '-'" title-width="120px" />
        </wd-cell-group>
      </view>
    </view>

    <view v-else-if="!isLoading" class="empty">
      <ck-status-tip image="content" tip="暂无发票信息" />
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
import { mcmInvoiceDelete, mcmInvoiceList } from '@/pages-mcm/service/invoice'

interface AccountItem {
  id?: string | number
  customerId?: string | number
  bankName?: string
  accountUser?: string
  accountNo?: string
  taxCode?: string
  address?: string
  phone?: string
  [key: string]: any
}

const props = defineProps<{
  data: CustomerDetailData
}>()

const message = useMessage()
const { success: showSuccess, error: showError, loading: showLoading, close: closeToast } = useToast()

// 发票列表数据
const accountList = ref<AccountItem[]>([])
const isLoading = ref(false)

// 获取客户ID
const getCustomerId = () => String((props.data as any)?.id ?? '')

// 获取发票列表
async function fetchInvoiceList() {
  const customerId = getCustomerId()
  if (!customerId) {
    console.warn('缺少客户ID，无法获取发票列表')
    return
  }

  isLoading.value = true
  try {
    const { data } = await mcmInvoiceList(customerId)
    // 处理返回的数据格式，可能是数组或对象包含list字段
    if (Array.isArray(data)) {
      accountList.value = data
    }
    else if (data && Array.isArray(data.list)) {
      accountList.value = data.list
    }
    else if (data && typeof data === 'object') {
      // 如果返回的是单个对象，转为数组
      accountList.value = [data]
    }
    else {
      accountList.value = []
    }
  }
  catch (e) {
    console.error('获取发票列表失败', e)
    showError({ msg: '获取发票列表失败' })
    accountList.value = []
  }
  finally {
    isLoading.value = false
  }
}

// 刷新发票列表（供外部调用）
function refreshInvoiceList() {
  fetchInvoiceList()
}

// 监听刷新事件
function handleRefresh() {
  refreshInvoiceList()
}

// 编辑发票信息
function handleEdit(item: AccountItem) {
  uni.navigateTo({
    url: `/pages-mcm/customer/invoice/invoiceAddOrUpdate?id=${item?.id ?? ''}&customerId=${getCustomerId()}`,
  })
}

// 新增发票信息
function handleAdd() {
  uni.navigateTo({
    url: `/pages-mcm/customer/invoice/invoiceAddOrUpdate?customerId=${getCustomerId()}`,
  })
}

// 删除发票信息
function handleRemove(item: AccountItem) {
  console.log('点击删除按钮', item)

  if (!item?.id) {
    showError({ msg: '缺少发票ID' })
    return
  }

  console.log('准备显示确认框')

  message
    .confirm({
      msg: '确定要删除该发票信息吗？',
      title: '提示',
    })
    .then(() => {
      console.log('用户确认删除')
      // 确认后执行删除
      showLoading({ msg: '删除中...' })
      mcmInvoiceDelete(item.id!)
        .then(() => {
          closeToast()
          showSuccess({ msg: '删除成功' })
          // 刷新发票列表
          refreshInvoiceList()
        })
        .catch((e) => {
          closeToast()
          console.error('删除发票信息失败', e)
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
  fetchInvoiceList()
  // 监听刷新事件
  uni.$on('refreshInvoiceList', handleRefresh)
})

onUnmounted(() => {
  // 清理事件监听
  uni.$off('refreshInvoiceList', handleRefresh)
})
</script>

<style lang="scss" scoped>
.invoice {
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
  padding: 16rpx 16rpx 8rpx;
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
