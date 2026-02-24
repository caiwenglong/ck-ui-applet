<!--
  * @description 客户详情 - Tabs 大组件（基础信息 / 常用收发人 / 发票信息 / 客户SOP）
-->
<template>
  <view class="detail-tabs">
    <wd-tabs v-model="activeTab" lineable custom-class="detail-tabs-bar">
      <wd-tab title="基础信息" name="base">
        <view class="tab-content">
          <CustomerDetailBaseInfo :data="data" />
        </view>
      </wd-tab>

      <wd-tab title="常用收发人" name="consigner">
        <view class="tab-content">
          <CustomerDetailConsigner :data="data" />
        </view>
      </wd-tab>

      <wd-tab title="发票信息" name="invoice">
        <view class="tab-content">
          <CustomerDetailInvoice :data="data" />
        </view>
      </wd-tab>

      <wd-tab title="客户 SOP" name="sop">
        <view class="tab-content">
          <CustomerDetailSop :data="data" />
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import type { CustomerDetailData } from '@/pages-mcm/type/customer'
import CustomerDetailBaseInfo from './components/CustomerDetailBaseInfo.vue'
import CustomerDetailConsigner from './consigner/CustomerDetailConsigner.vue'
import CustomerDetailInvoice from './invoice/CustomerDetailInvoice.vue'
import CustomerDetailSop from './sop/CustomerDetailSop.vue'

defineProps<{
  data: CustomerDetailData
}>()

const activeTab = ref<'base' | 'consigner' | 'invoice' | 'sop'>('base')
</script>

<style lang="scss" scoped>
.detail-tabs {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.tab-content {
  padding: 12rpx 16rpx 20rpx;
}

.placeholder {
  min-height: 120rpx;
}
</style>
