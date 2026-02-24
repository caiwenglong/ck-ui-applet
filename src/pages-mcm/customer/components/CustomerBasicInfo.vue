<!--
  * @description 客户基本信息组件
-->
<template>
  <wd-cell-group border>
    <!-- 客户名称 -->
    <wd-cell title="客户名称" title-width="120px">
      <view class="customer-name-wrapper">
        <CKIcon
          v-if="data.keyCustomerStar"
          custom-class="vip-icon"
          line-height="14rpx"
          name="vip2"
          size="14px"
        />
        <CKIcon
          v-if="data.customerType === 1"
          custom-class="type-icon"
          line-height="19rpx"
          name="customer_icon_company"
          size="19px"
        />
        <CKIcon
          v-if="data.customerType === 2"
          custom-class="type-icon"
          line-height="19rpx"
          name="customer_icon_person"
          size="19px"
        />
        <text class="customer-name">{{ customerNameDisplay }}</text>
      </view>
    </wd-cell>

    <!-- 合作状态 -->
    <wd-cell :value="cooperateStateText" title="合作状态" title-width="120px" />

    <!-- 主营品名 -->
    <wd-cell :value="data.goodsNames || '-'" title="主营品名" title-width="120px" />

    <!-- 关联客户 -->
    <wd-cell title="关联客户" title-width="120px">
      <view class="associated-customer-wrapper">
        <text class="associated-customer-text">{{ associatedCustomerDisplay || '-' }}</text>
        <CKIcon
          custom-class="edit-icon"
          line-height="16rpx"
          name="edit"
          size="16px"
          @click.stop="handleEditAssociatedCustomer"
        />
      </view>
    </wd-cell>

    <!-- 更多信息 -->
    <view class="more-info-wrapper" @click="handleOpenMoreInfo">
      <text class="more-info-text">更多信息</text>
    </view>
  </wd-cell-group>

  <!-- 更多信息弹窗 -->
  <wd-popup
    v-model="showMoreInfoPopup"
    :safe-area-inset-bottom="true"
    custom-style="border-radius: 16px 16px 0 0; max-height: 80vh;"
    position="bottom"
    z-index="101"
  >
    <view class="more-info-popup">
      <view class="popup-header">
        <text class="popup-title">更多信息</text>
      </view>
      <scroll-view class="popup-content" :scroll-y="true">
        <wd-cell-group border>
          <wd-cell :value="customerSourceText" title="客户来源" title-width="120px" />
          <wd-cell title="介绍人" title-width="120px">
            <text v-if="data.introducerName" class="introducer-link" @click="handleViewIntroducer">
              {{ data.introducerName }}
            </text>
            <text v-else>-</text>
          </wd-cell>
          <wd-cell title="客户星级" title-width="120px">
            <view class="star-rating-wrapper">
              <text
                v-for="(star, index) in 5"
                :key="index"
                :class="index < (data.starLevel || 0) ? 'star-filled' : 'star-outline'"
              >
                {{ index < (data.starLevel || 0) ? '★' : '☆' }}
              </text>
            </view>
          </wd-cell>
          <wd-cell :value="data.customerCity || '-'" title="客户所在城市" title-width="120px" />
          <wd-cell :value="data.nativePlace || '-'" title="籍贯" title-width="120px" />
          <wd-cell :value="data.socialCreditCode || '-'" title="社会信用代码" title-width="120px" />
        </wd-cell-group>
      </scroll-view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import type { CustomerDetailData } from '@/pages-mcm/type/customer'
import CKIcon from '@/pages-mcm/components/CKIcon/CKIcon.vue'
import { dict } from '@/pages-mcm/utils'

const props = defineProps<{
  data: CustomerDetailData
}>()

const emit = defineEmits<{
  editAssociatedCustomer: []
  viewIntroducer: [customerId: string | number]
}>()

// 是否显示更多信息弹窗
const showMoreInfoPopup = ref(false)

// 客户名称显示（公司/个人由图标区分，文字只显示名称）
const customerNameDisplay = computed(() => props.data.customerName || '')

// 合作状态文本
const cooperateStateText = computed(() => {
  if (!props.data.cooperateState)
    return '-'
  try {
    return dict('cooperate_state', props.data.cooperateState)
  }
  catch (e) {
    return props.data.cooperateState || '-'
  }
})

// 客户来源文本
const customerSourceText = computed(() => {
  if (!props.data.customerSource)
    return '-'
  try {
    return dict('customer_source', props.data.customerSource)
  }
  catch (e) {
    return props.data.customerSource || '-'
  }
})

// 关联客户显示文本
const associatedCustomerDisplay = computed(() => {
  const associateCustomerList = props.data.subsidiaryMap?.associateCustomer
  if (
    !associateCustomerList
    || !Array.isArray(associateCustomerList)
    || associateCustomerList.length === 0
  ) {
    return ''
  }
  return associateCustomerList
    .map((item: any) => item.associateCustomerName)
    .filter(Boolean)
    .join('、')
})

// 打开更多信息弹窗
function handleOpenMoreInfo() {
  showMoreInfoPopup.value = true
}

// 编辑关联客户
function handleEditAssociatedCustomer() {
  emit('editAssociatedCustomer')
}

// 查看介绍人
function handleViewIntroducer() {
  if (props.data.introducerCustomerId) {
    emit('viewIntroducer', props.data.introducerCustomerId)
  }
}
</script>

<style lang="scss" scoped>
.customer-name-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.vip-icon {
  margin-right: 4rpx;
}

.type-icon {
  margin-right: 4rpx;
}

.customer-name {
  font-size: 28rpx;
  color: #333;
}

.associated-customer-wrapper {
  display: flex;
  align-items: center;
  gap: 8rpx;
  width: 100%;
}

.associated-customer-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
}

.edit-icon {
  color: #4d80f0;
  cursor: pointer;
}

.more-info-wrapper {
  padding: 24rpx 32rpx;
  text-align: center;
  border-top: 1rpx solid #ebeef5;
}

.more-info-text {
  font-size: 28rpx;
  color: #4d80f0;
}

.more-info-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;
}

.popup-header {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #ebeef5;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
  box-sizing: border-box;
}

.introducer-link {
  font-size: 28rpx;
  color: #4d80f0;
  cursor: pointer;
}

.star-rating-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.star-filled {
  color: #ffd700;
  font-size: 32rpx;
}

.star-outline {
  color: #ddd;
  font-size: 32rpx;
}
</style>
