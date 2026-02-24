<!--
  * @description 客户详情页底部操作栏
-->
<template>
  <view class="customer-action-bar">
    <!-- 更多按钮（圆形图标 + 文字在图标外下方） -->
    <view class="more-btn-wrapper" @click="handleMoreClick">
      <view class="action-btn more-btn">
        <wd-icon name="more" size="24px" color="#666" />
      </view>
      <text class="more-btn-text">更多</text>
    </view>

    <!-- 写跟进按钮（矩形，亮绿色） -->
    <view class="action-btn follow-btn" @click="handleFollowUpClick">
      <text class="btn-text">写跟进</text>
    </view>

    <!-- 打电话按钮（矩形，亮蓝色） -->
    <view class="action-btn call-btn" @click="handleCallClick">
      <text class="btn-text">打电话</text>
    </view>

    <!-- ActionSheet 动作面板 -->
    <wd-action-sheet
      v-model="showActionSheet"
      :panels="actionSheetPanels"
      :safe-area-inset-bottom="true"
      @select="handleActionSelect"
      @close="handleActionClose"
    />

    <!-- FollowUpAdd 组件 -->
    <FollowUpAdd
      v-model="showFollowUpAdd"
      :customer-id="props.customerId || ''"
      @saved="handleFollowUpSaved"
    />

    <!-- Message Box 用于确认弹窗 -->
    <wd-message-box />

    <!-- 联系人选择弹窗 -->
    <ContactSelector
      v-model="showContactSelector"
      :contact-list="props.contactList || []"
      :customer-id="props.customerId"
      @close="handleContactSelectorClose"
    />
  </view>
</template>

<script lang="ts" setup>
import { useMessage, useToast } from 'wot-design-uni'
import FollowUpAdd from '@/pages-mcm/customer/components/CustomerLatestFollowUp/components/FollowUpAdd.vue'
import { mcmCustomerDelete } from '@/pages-mcm/service/customer'
import ContactSelector from './components/ContactSelector.vue'

// Props
const props = defineProps<{
  customerId?: string | number
  contactList?: ContactItem[]
}>()
// Emits
const emit = defineEmits<{
  'follow-up-saved': []
  'customer-deleted': []
}>()
const message = useMessage()
const { success: showSuccess, error: showError, loading: showLoading, close: closeToast } = useToast()

// 联系人数据类型
interface ContactItem {
  contactName?: string
  post?: string
  contactPhone?: string
  [key: string]: any
}

// ActionSheet 显示状态
const showActionSheet = ref(false)

// FollowUpAdd 组件显示状态
const showFollowUpAdd = ref(false)

// ContactSelector 组件显示状态
const showContactSelector = ref(false)

// CKIcon 图标基础 URL
const iconBaseUrl = 'https://ckscm-dev.oss-cn-hangzhou.aliyuncs.com/test/mobile/'

// ActionSheet 面板数据
const actionSheetPanels = ref([
  [
    {
      iconUrl: `${iconBaseUrl}customer_details_edit.png`,
      title: '编辑',
      type: 'edit',
    },
    {
      iconUrl: `${iconBaseUrl}customer_details_del.png`,
      title: '删除',
      type: 'delete',
    },
  ],
])

// 更多按钮点击
function handleMoreClick() {
  showActionSheet.value = true
}

// ActionSheet 选项选择
function handleActionSelect({ item, index }: { item: any, index: number }) {
  console.log('选中项:', item, '下标:', index)
  showActionSheet.value = false

  if (item.type === 'edit') {
    // 跳转到客户编辑页面
    if (!props.customerId) {
      uni.showToast({ title: '缺少客户ID', icon: 'none' })
      return
    }
    uni.navigateTo({
      url: `/pages-mcm/customer/customerAddOrUpdate?id=${props.customerId}`,
    })
  }
  else if (item.type === 'delete') {
    // 删除客户
    handleDeleteCustomer()
  }
}

// ActionSheet 关闭
function handleActionClose() {
  showActionSheet.value = false
}

// 写跟进按钮点击
function handleFollowUpClick() {
  if (!props.customerId) {
    uni.showToast({ title: '缺少客户ID', icon: 'none' })
    return
  }

  showFollowUpAdd.value = true
}

// 跟进保存后的回调
function handleFollowUpSaved() {
  emit('follow-up-saved')
}

// 删除客户
function handleDeleteCustomer() {
  if (!props.customerId) {
    uni.showToast({ title: '缺少客户ID', icon: 'none' })
    return
  }

  message
    .confirm({
      msg: '请确保客户无关联订单或报价',
      title: '确认删除？',
    })
    .then(() => {
      // 用户确认删除
      showLoading({ msg: '删除中...' })
      mcmCustomerDelete(props.customerId!)
        .then(() => {
          closeToast()
          showSuccess({ msg: '删除成功' })
          // 通知父组件客户已删除
          emit('customer-deleted')
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        })
        .catch((e) => {
          closeToast()
          console.error('删除客户失败', e)
          showError({ msg: '删除失败' })
        })
    })
    .catch(() => {
      // 用户取消删除，不做任何操作
    })
}

// 打电话按钮点击
function handleCallClick() {
  // 检查是否有联系人
  if (!props.contactList || props.contactList.length === 0) {
    uni.showToast({ title: '暂无联系人', icon: 'none' })
    return
  }
  // 打开联系人选择弹窗
  showContactSelector.value = true
}

// 联系人选择弹窗关闭
function handleContactSelectorClose() {
  showContactSelector.value = false
}
</script>

<style lang="scss" scoped>
.customer-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  z-index: 100;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.3s;

  &:active {
    opacity: 0.7;
  }
}

// 更多按钮包装（图标 + 文字上下结构，与隔壁按钮同高 88rpx）
.more-btn-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  height: 88rpx;
  flex-shrink: 0;
  cursor: pointer;
  transition: opacity 0.3s;

  &:active {
    opacity: 0.7;
  }
}

// 更多按钮（圆形，灰色，仅图标）
.more-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background-color: #e0e0e0;
}

.more-btn-text {
  font-size: 20rpx;
  color: #666;
}

// 写跟进按钮（矩形，亮绿色，缩小约 50rpx）
.follow-btn {
  flex: 0 1 calc(50% - 90rpx);
  height: 88rpx;
  margin: 0 12rpx;
  border-radius: 12rpx;
  background-color: #4caf50;
  color: #fff;
}

// 打电话按钮（矩形，亮蓝色，加长）
.call-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  background-color: #2196f3;
  color: #fff;
}

.btn-text {
  font-size: 30rpx;
  font-weight: 500;
  color: inherit;
}
</style>
