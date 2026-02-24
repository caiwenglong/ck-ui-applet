<!--
  * @description mcm - 客户详情
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="customer-details-page">
    <!--  标题  -->
    <wd-navbar
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      custom-style="background-color: #eae6ff !important;"
      title="客户详情"
      @click-left="handleGeneralBack"
    />

    <!--  内容区域  -->
    <view class="content-wrapper">
      <!-- 客户基本信息 -->
      <CustomerBasicInfo
        v-if="customerData"
        :data="customerData"
        @edit-associated-customer="handleEditAssociatedCustomer"
        @view-introducer="handleViewIntroducer"
      />

      <!-- 最新跟进 -->
      <CustomerLatestFollowUp v-if="customerData" :data="customerData" />

      <!-- Tabs 大组件（基础信息/常用收发人/发票信息/客户SOP） -->
      <CustomerDetailTabs v-if="customerData" :data="customerData" />
    </view>

    <!-- 底部操作栏 -->
    <CustomerActionBar
      :customer-id="customerData?.id"
      :contact-list="(customerData as any)?.customerContactList || []"
      @follow-up-saved="handleFollowUpSaved"
    />
  </view>
</template>

<script lang="ts" setup>
import type { CustomerDetailData } from '@/pages-mcm/type/customer'
import { onLoad, onShow } from '@dcloudio/uni-app'
import CustomerActionBar from '@/pages-mcm/customer/components/CustomerActionBar/index.vue'
import CustomerBasicInfo from '@/pages-mcm/customer/components/CustomerBasicInfo.vue'
import CustomerDetailTabs from '@/pages-mcm/customer/components/customerDetailTabs/index.vue'
import CustomerLatestFollowUp from '@/pages-mcm/customer/components/CustomerLatestFollowUp/index.vue'
import { mcmCustomerDetail } from '@/pages-mcm/service/customer'
import { handleGeneralBack } from '@/utils/function'

// 路由参数
const routeOptions = ref<{ id?: string }>({})

// 客户数据
const customerData = ref<CustomerDetailData | null>(null)

// 标记是否已初始化（避免首次加载时 onShow 重复请求）
const isInitialized = ref(false)

// 获取客户详情
async function getCustomerDetail() {
  if (!routeOptions.value.id) {
    uni.showToast({ title: '缺少客户ID', icon: 'none' })
    return
  }

  try {
    const { data } = await mcmCustomerDetail(routeOptions.value.id)
    customerData.value = data
  }
  catch (e) {
    console.error('获取客户详情失败', e)
    uni.showToast({ title: '获取客户详情失败', icon: 'none' })
  }
}

// 编辑关联客户
function handleEditAssociatedCustomer() {
  uni.showToast({ title: '编辑关联客户功能待开发', icon: 'none' })
  // TODO: 实现编辑关联客户功能
}

// 查看介绍人
function handleViewIntroducer(customerId: string | number) {
  uni.navigateTo({
    url: `/pages-mcm/customer/customerDetails?id=${customerId}`,
  })
}

// 跟进保存后的回调
function handleFollowUpSaved() {
  // 刷新客户详情数据
  if (routeOptions.value.id) {
    getCustomerDetail()
  }
}

// 页面加载时获取路由参数
onLoad((options) => {
  routeOptions.value = options || {}
  if (routeOptions.value.id) {
    getCustomerDetail().finally(() => {
      isInitialized.value = true
    })
  }
})

// 页面显示时刷新数据（从子页面返回时会触发）
onShow(() => {
  // 只有在已初始化且有客户ID时才刷新，避免首次加载时重复请求
  if (isInitialized.value && routeOptions.value.id) {
    getCustomerDetail()
  }
})
</script>

<style lang="scss" scoped>
.customer-details-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content-wrapper {
  padding: 24rpx;
  // 底部操作栏高度（88rpx按钮 + 40rpx上下padding）+ 安全区
  padding-bottom: calc(24rpx + 128rpx + env(safe-area-inset-bottom));
}
</style>
