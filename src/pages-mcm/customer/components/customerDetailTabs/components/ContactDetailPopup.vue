<!--
  * @description 联系人详情弹窗组件 - 从下而上弹出，显示联系人详细信息
-->
<template>
  <wd-popup
    v-model="visible"
    position="bottom"
    :safe-area-inset-bottom="true"
    custom-style="border-radius: 16px 16px 0 0; max-height: 80vh;"
    :close-on-click-modal="true"
    z-index="101"
  >
    <view class="contact-detail-popup">
      <!-- 头部 -->
      <view class="header">
        <text class="title">更多信息</text>
      </view>

      <!-- 内容区域 -->
      <scroll-view scroll-y class="content">
        <view class="info-list">
          <!-- 联系人名称 -->
          <view class="info-item">
            <text class="info-label">联系人名称</text>
            <text class="info-value">{{ formatContactName(contact) }}</text>
          </view>

          <!-- 联系人电话 -->
          <view class="info-item">
            <text class="info-label">联系人电话</text>
            <text class="info-value">{{ getContactValue('contactPhone') }}</text>
          </view>

          <!-- 邮箱 -->
          <view class="info-item">
            <text class="info-label">邮箱</text>
            <text class="info-value">{{ getContactValue('email') }}</text>
          </view>

          <!-- 微信 -->
          <view class="info-item">
            <text class="info-label">微信</text>
            <text class="info-value">{{ getContactValue('wechat') }}</text>
          </view>

          <!-- QQ -->
          <view class="info-item">
            <text class="info-label">QQ</text>
            <text class="info-value">{{ getContactValue('qq') }}</text>
          </view>

          <!-- 备注 -->
          <view class="info-item">
            <text class="info-label">备注</text>
            <text class="info-value">{{ getContactValue('remark') }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
interface ContactItem {
  contactName?: string
  post?: string
  contactPhone?: string
  email?: string
  wechat?: string
  qq?: string
  remark?: string
  [key: string]: any
}

const props = defineProps<{
  modelValue: boolean
  contact: ContactItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 格式化联系人名称（带职位）
function formatContactName(contact: ContactItem | null) {
  if (!contact)
    return '-'
  const name = contact.contactName || '-'
  return contact.post ? `${name}(${contact.post})` : name
}

// 安全获取联系人字段值
function getContactValue(key: keyof ContactItem) {
  if (!props.contact)
    return '-'
  return props.contact[key] || '-'
}
</script>

<style lang="scss" scoped>
.contact-detail-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  max-height: 80vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;

  .title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1f1f1f;
  }
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 0 32rpx;
  box-sizing: border-box;
  padding-bottom: 32rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 28rpx;
    color: #1f1f1f;
    font-weight: 400;
    flex-shrink: 0;
  }

  .info-value {
    font-size: 28rpx;
    color: #666;
    text-align: right;
    flex: 1;
    margin-left: 32rpx;
    word-break: break-all;
  }
}
</style>
