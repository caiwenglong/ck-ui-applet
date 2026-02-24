<!--
  * @description 客户详情 - 基础信息（第一个 Tab）
  * 包含：联系人、业务信息
-->
<template>
  <view class="base-info">
    <!-- 联系人 -->
    <view class="section">
      <view class="section-title">
        <view class="bar" />
        <text class="title">联系人</text>
      </view>

      <view v-if="contactList.length" class="section-body">
        <view v-for="(contact, idx) in contactList" :key="contact.id || idx" class="contact-card">
          <view class="contact-card-header">
            <text class="contact-card-title">联系人{{ Number(idx) + 1 }}</text>
            <!-- 详细信息 -->
            <view class="contact-card-action" @click="handleContactMore(contact)">
              <text class="action-text">详细信息</text>
            </view>
          </view>

          <wd-cell-group border>
            <wd-cell :value="formatContactName(contact)" title="联系人名称" title-width="120px" />

            <wd-cell title="联系人电话" title-width="120px">
              <view
                v-if="contact.contactPhone"
                class="phone-row phone-row-clickable"
                @click.stop="handlePhone(contact.contactPhone)"
              >
                <text class="phone-text">{{ contact.contactPhone }}</text>
                <view class="phone-btn">
                  <CKIcon line-height="18rpx" name="phone" size="18px" />
                </view>
              </view>
              <view v-else class="phone-row">
                <text class="phone-text">-</text>
              </view>
            </wd-cell>

            <wd-cell :value="contact.remark || '-'" title="备注" title-width="120px" />
          </wd-cell-group>
        </view>
      </view>

      <view v-else class="empty">
        暂无联系人
      </view>
    </view>

    <!-- 业务信息 -->
    <view class="section">
      <view class="section-title">
        <view class="bar" />
        <text class="title">业务信息</text>
      </view>

      <view class="section-body">
        <wd-cell-group border>
          <wd-cell :value="data.goodsNames || '-'" title="主营品名" title-width="120px" />
          <wd-cell :value="data.fundingRequirements || '-'" title="资金需求" title-width="120px" />
          <wd-cell :value="data.annualScale || '-'" title="年进口量规模" title-width="120px" />
          <wd-cell
            :value="data.annualExportScale || '-'"
            title="年出口量规模"
            title-width="120px"
          />
          <wd-cell :value="data.importCountry || '-'" title="进口国家" title-width="120px" />
          <wd-cell :value="data.exportCountry || '-'" title="出口国家" title-width="120px" />
          <wd-cell :value="data.importPort || '-'" title="进口口岸" title-width="120px" />
          <wd-cell :value="data.exportPort || '-'" title="出口口岸" title-width="120px" />
          <wd-cell :value="data.importGoods || '-'" title="进口产品" title-width="120px" />
          <wd-cell :value="data.exportGoods || '-'" title="出口产品" title-width="120px" />
          <wd-cell :value="data.remark || '-'" title="备注" title-width="120px" />
        </wd-cell-group>
      </view>
    </view>

    <!-- 负责人信息 -->
    <view class="section">
      <view class="section-title">
        <view class="bar" />
        <text class="title">负责人信息</text>
      </view>

      <view class="section-body">
        <wd-cell-group border>
          <wd-cell :value="data.salesmanName || '-'" title="负责人" title-width="120px" />
          <wd-cell :value="assistantDisplay" title="协助人" title-width="120px" />
        </wd-cell-group>
      </view>
    </view>

    <!-- 联系人详情弹窗 -->
    <ContactDetailPopup v-model="showContactDetail" :contact="currentContact" />

    <!-- 添加跟进信息确认弹窗 -->
    <FollowUpConfirmDialog
      v-model="showFollowUpConfirm"
      :customer-id="props.data?.id"
    />
  </view>
</template>

<script lang="ts" setup>
import type { CustomerDetailData } from '@/pages-mcm/type/customer'
import { onShow } from '@dcloudio/uni-app'
import CKIcon from '@/pages-mcm/components/CKIcon/CKIcon.vue'
import FollowUpConfirmDialog from '@/pages-mcm/customer/components/FollowUpConfirmDialog.vue'
import ContactDetailPopup from './ContactDetailPopup.vue'

interface CustomerContact {
  id?: string | number
  contactName?: string
  post?: string
  contactPhone?: string
  remark?: string
  [key: string]: any
}

const props = defineProps<{
  data: CustomerDetailData
}>()

const contactList = computed<CustomerContact[]>(() => {
  const list = (props.data as any)?.customerContactList
  return Array.isArray(list) ? list : []
})

const assistantDisplay = computed(() => {
  const d = props.data as any

  // 优先使用后端直接返回的“协助人名称”字段（如果存在）
  const assistantNames
    = d?.assistantNames ?? d?.assistantName ?? d?.assistantUserNames ?? d?.assistantUserName
  if (Array.isArray(assistantNames)) {
    const v = assistantNames.filter(Boolean).join('、')
    return v || '-'
  }
  if (typeof assistantNames === 'string' && assistantNames.trim())
    return assistantNames.trim()

  // 兜底：展示 assistantIds（可能是逗号分隔字符串或数组）
  const ids = d?.assistantIds
  if (!ids)
    return '-'
  if (Array.isArray(ids)) {
    const v = ids.filter(Boolean).join(',')
    return v || '-'
  }
  if (typeof ids === 'string')
    return ids.trim() || '-'
  return String(ids)
})

function formatContactName(contact: CustomerContact) {
  const name = contact.contactName || '-'
  return contact.post ? `${name}(${contact.post})` : name
}

// 联系人详情弹窗相关
const showContactDetail = ref(false)
const currentContact = ref<CustomerContact | null>(null)

// 跟进确认弹窗相关
const showFollowUpConfirm = ref(false)

// 拨打电话标记（用于 onShow 判断是否从拨号界面返回）
const isCalling = ref(false)

// 打开联系人详情弹窗
function handleContactMore(contact: CustomerContact) {
  currentContact.value = contact
  showContactDetail.value = true
}

// 拨打电话
function handlePhone(phone: string) {
  const p = (phone || '').toString().trim()
  if (!p)
    return
  isCalling.value = true
  uni.makePhoneCall({
    phoneNumber: p,
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
.base-info {
  padding: 12rpx 0;
}

.section + .section {
  margin-top: 24rpx;
}

.section-title {
  display: flex;
  align-items: center;
  padding: 8rpx 0 16rpx;
}

.bar {
  width: 6rpx;
  height: 28rpx;
  background: #2f6bff;
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.contact-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx 12rpx;
}

.contact-card-title {
  font-size: 28rpx;
  color: #1f1f1f;
  font-weight: 500;
}

.contact-card-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background: rgba(47, 107, 255, 0.08);
  transition: all 0.3s;
  cursor: pointer;

  &:active {
    background: rgba(47, 107, 255, 0.15);
    transform: scale(0.98);
  }
}

.action-text {
  font-size: 28rpx;
  color: #2f6bff;
  font-weight: 500;
}

.action-icon {
  color: #2f6bff;
  transition: transform 0.3s;
}

.contact-card-action:active .action-icon {
  transform: translateX(4rpx);
}

.phone-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.phone-row-clickable {
  padding: 8rpx 0;
  margin: -8rpx 0;
  border-radius: 8rpx;

  &:active {
    background: rgba(77, 128, 240, 0.06);
  }
}

.phone-text {
  font-size: 28rpx;
  color: #1f1f1f;
}

.phone-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 999px;
  background: rgba(77, 128, 240, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  padding: 24rpx 0;
  color: #999;
  font-size: 28rpx;
  text-align: center;
}
</style>
