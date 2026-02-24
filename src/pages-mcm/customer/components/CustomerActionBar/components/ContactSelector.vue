<!--
  * @description 联系人选择弹窗组件
-->
<template>
  <wd-popup
    v-model="visible"
    position="bottom"
    :safe-area-inset-bottom="true"
    custom-style="border-radius: 16px 16px 0 0; max-height: 80vh;"
    @close="handleClose"
  >
    <view class="contact-selector">
      <!-- 头部 -->
      <view class="header">
        <text class="title">选择联系人</text>
      </view>

      <!-- 联系人列表 -->
      <scroll-view scroll-y class="contact-list">
        <view
          v-for="(contact, index) in contactList"
          :key="index"
          class="contact-group"
        >
          <!-- 联系人标识 -->
          <view class="contact-header">
            <text class="contact-label">联系人{{ Number(index) + 1 }}</text>
          </view>

          <!-- 联系人信息 -->
          <view
            class="contact-item"
            :class="{ 'contact-item-clickable': contact.contactPhone }"
            @click.stop="contact.contactPhone && handleCall(contact)"
          >
            <view class="contact-info">
              <text class="contact-name">{{ formatContactName(contact) }}</text>
              <text class="contact-phone">{{ contact.contactPhone || '-' }}</text>
            </view>
            <view v-if="contact.contactPhone" class="phone-icon-wrapper">
              <CKIcon line-height="18rpx" name="phone" size="18px" />
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="contactList.length === 0" class="empty-state">
          <text>暂无联系人</text>
        </view>
      </scroll-view>
    </view>
  </wd-popup>

  <!-- 添加跟进信息确认弹窗 -->
  <FollowUpConfirmDialog
    v-model="showFollowUpConfirm"
    :customer-id="props.customerId"
  />
</template>

<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app'
import CKIcon from '@/pages-mcm/components/CKIcon/CKIcon.vue'
import FollowUpConfirmDialog from '@/pages-mcm/customer/components/FollowUpConfirmDialog.vue'

interface ContactItem {
  contactName?: string
  post?: string
  contactPhone?: string
  [key: string]: any
}

const props = defineProps<{
  modelValue: boolean
  contactList: ContactItem[]
  customerId?: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 控制跟进确认弹窗显示
const showFollowUpConfirm = ref(false)

// 拨打电话标记（用于 onShow 判断是否从拨号界面返回）
const isCalling = ref(false)

// 格式化联系人名称
function formatContactName(contact: ContactItem) {
  const name = contact.contactName || '-'
  return contact.post ? `${name}(${contact.post})` : name
}

// 关闭弹窗
function handleClose() {
  visible.value = false
  emit('close')
}

// 拨打电话
function handleCall(contact: ContactItem) {
  const phone = (contact.contactPhone || '').toString().trim()
  if (!phone) {
    uni.showToast({ title: '无可用电话', icon: 'none' })
    return
  }
  isCalling.value = true
  // 关闭联系人选择弹窗（用户即将跳转到拨号界面）
  handleClose()
  uni.makePhoneCall({
    phoneNumber: phone,
    success: () => {
      // 拨号成功不直接弹窗，而是等回到页面(onShow)再判断
    },
    fail: () => {
      isCalling.value = false
      uni.showToast({ title: '拨号取消', icon: 'none' })
    },
  })
}

// 监听页面显示，用于判断是否从拨号界面返回
onShow(() => {
  if (isCalling.value) {
    isCalling.value = false
    setTimeout(() => {
      showFollowUpConfirm.value = true
    }, 500)
  }
})
</script>

<style lang="scss" scoped>
.contact-selector {
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

  .close-btn {
    font-size: 28rpx;
    color: #1f1f1f;
    cursor: pointer;
  }
}

.contact-list {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx;
  box-sizing: border-box;
  padding-bottom: 32rpx;
}

.contact-group {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.contact-header {
  background-color: #f5f5f5;
  padding: 16rpx 16rpx;
  margin-bottom: 0;

  .contact-label {
    font-size: 28rpx;
    color: #1f1f1f;
    font-weight: 500;
  }
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 16rpx;
  background-color: #fff;
  transition: background-color 0.2s;

  .contact-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16rpx;

    .contact-name {
      font-size: 28rpx;
      color: #1f1f1f;
    }

    .contact-phone {
      font-size: 28rpx;
      color: #1f1f1f;
    }
  }

  .phone-icon-wrapper {
    width: 44rpx;
    height: 44rpx;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 16rpx;
  }
}

.contact-item-clickable {
  cursor: pointer;

  &:active {
    background-color: rgba(77, 128, 240, 0.06);
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
