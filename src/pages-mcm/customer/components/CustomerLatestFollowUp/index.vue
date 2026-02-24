<!--
  * @description 客户最新跟进组件（展示用）
-->
<template>
  <view class="latest-follow-up">
    <view class="header">
      <text class="title">最新跟进</text>
      <!-- 查看更多：先留空（仅占位） -->
      <text class="more" @click="handleViewMore">查看更多</text>
    </view>

    <wd-cell-group border>
      <wd-cell title="跟进内容" :value="trackContentText" title-width="120px" />
      <wd-cell title="下一步任务" :value="nextTaskText" title-width="120px" />
      <wd-cell title="跟进人" :value="followByText" title-width="120px" />
      <wd-cell title="跟进日期" :value="followDateText" title-width="120px" />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import type { CustomerDetailData } from '@/pages-mcm/type/customer'
import dayjs from 'dayjs'

const props = defineProps<{
  data: CustomerDetailData
}>()

// 最新跟进：后端结构为 data.subsidiaryMap.track
const latestTrack = computed<any>(() => {
  return (
    (props.data as any)?.subsidiaryMap?.track
    || (props.data as any)?.latestTrack
    || (props.data as any)?.latestFollowUp
    || null
  )
})

const trackContentText = computed(() => {
  return latestTrack.value?.trackContent || '-'
})

const nextTaskText = computed(() => {
  return latestTrack.value?.nextStep || '-'
})

const followByText = computed(() => {
  return latestTrack.value?.trackUserName || '-'
})

const followDateText = computed(() => {
  // 优先 followUpDate（跟进日期），兜底 createTime
  const raw = latestTrack.value?.followUpDate || latestTrack.value?.createTime
  if (!raw)
    return '-'
  const d = dayjs(raw)
  return d.isValid() ? d.format('YYYY.M.D') : String(raw)
})

// 查看更多：跳转到跟进记录列表页面
function handleViewMore() {
  const customerId = props.data?.id
  if (!customerId) {
    uni.showToast({ title: '缺少客户ID', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages-mcm/customer/followUp/index?customerId=${customerId}`,
  })
}
</script>

<style lang="scss" scoped>
.latest-follow-up {
  margin-top: 24rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8rpx 16rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.more {
  font-size: 28rpx;
  color: #1f1f1f;
}
</style>
