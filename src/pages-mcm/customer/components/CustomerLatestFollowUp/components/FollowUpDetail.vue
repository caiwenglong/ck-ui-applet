<!--
  * @description 跟进详情弹窗组件
-->
<template>
  <wd-popup
    v-model="visible"
    position="bottom"
    custom-style="border-radius: 16px 16px 0 0; z-index: 1000;"
    @close="handleClose"
  >
    <view class="detail-popup">
      <view class="detail-header">
        <text class="detail-title">跟进详情</text>
        <text class="detail-close" @click="handleClose">关闭</text>
      </view>
      <view v-if="detailData" class="detail-content">
        <view class="detail-item">
          <text class="detail-label">跟进内容</text>
          <text class="detail-value">{{ detailData.trackContent || '-' }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">下一步任务</text>
          <text class="detail-value">{{ detailData.nextStep || '-' }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">回访日期</text>
          <text class="detail-value">{{ formatDate(detailData.followUpDate) }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">跟进方式</text>
          <text class="detail-value">
            {{
              detailData.followUpMethod ? getFollowUpMethodName(detailData.followUpMethod) : '-'
            }}
          </text>
        </view>
        <view class="detail-item">
          <text class="detail-label">跟进人</text>
          <text class="detail-value">
            {{
              detailData.participantNames || detailData.trackUserName || '-'
            }}
          </text>
        </view>
        <view class="detail-item">
          <text class="detail-label">参与人</text>
          <text class="detail-value">{{ detailData.participantNames || '-' }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">地点</text>
          <text class="detail-value">{{ detailData.location || '-' }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">抄送人员</text>
          <text class="detail-value">{{ detailData.ccUserNames || '-' }}</text>
        </view>
      </view>
      <view class="detail-footer">
        <button class="detail-reply-button" @click="handleReply">
          回复评论
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { apiGetDictByType } from '@/service/common'

const props = defineProps<{
  modelValue: boolean
  detailData?: any
  followUpMethodList?: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'reply': []
  'close': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 跟进方式字典
const followUpMethodList = ref<any[]>(props.followUpMethodList || [])

// 如果没有传入字典列表，则获取
watch(
  () => props.followUpMethodList,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      followUpMethodList.value = newVal
    }
  },
  { immediate: true },
)

// 如果没有传入字典列表，则获取
if (!props.followUpMethodList || props.followUpMethodList.length === 0) {
  const getFollowUpMethodList = async () => {
    try {
      const { data } = await apiGetDictByType('follow_up_method')
      followUpMethodList.value = (data as any[]).map((item: any) => ({
        label: item.dictLabel,
        value: item.dictValue,
      }))
    }
    catch (e) {
      console.error('获取跟进方式失败', e)
    }
  }
  getFollowUpMethodList()
}

// 格式化日期
function formatDate(dateStr: string | null | undefined) {
  if (!dateStr)
    return '-'
  const d = dayjs(dateStr)
  return d.isValid() ? d.format('YYYY-MM-DD') : String(dateStr)
}

// 获取跟进方式名称
function getFollowUpMethodName(methodValue: string | number) {
  if (!methodValue)
    return ''
  const method = followUpMethodList.value.find(
    item => String(item.value) === String(methodValue),
  )
  return method ? method.label : String(methodValue)
}

// 关闭弹窗
function handleClose() {
  visible.value = false
  emit('close')
}

// 回复评论
function handleReply() {
  emit('reply')
}
</script>

<style lang="scss" scoped>
.detail-popup {
  background-color: #fff;
  padding: 0 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 0;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 1;

    .detail-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .detail-close {
      font-size: 28rpx;
      color: #666;
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 32rpx 0;

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24rpx 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        font-size: 28rpx;
        color: #666;
        width: 160rpx;
        flex-shrink: 0;
      }

      .detail-value {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        text-align: right;
        word-break: break-all;
      }
    }
  }

  .detail-footer {
    padding-top: 24rpx;
    border-top: 1px solid #eee;
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));

    .detail-reply-button {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      background-color: #2979ff;
      color: #fff;
      border-radius: 8rpx;
      font-size: 32rpx;
      font-weight: 500;
      border: none;

      &::after {
        border: none;
      }
    }
  }
}
</style>
