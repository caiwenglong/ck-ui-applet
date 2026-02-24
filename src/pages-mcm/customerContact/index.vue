<template>
  <view class="contact-page">
    <!--  标题  -->
    <wd-navbar
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      custom-style="background-color: #eae6ff !important;"
      title="联系人"
      @click-left="handleGeneralBack"
    />

    <!-- 顶部搜索 -->
    <view class="header-section">
      <view class="search-container">
        <wd-search
          v-model="searchValue"
          placeholder="搜索联系人姓名、电话等"
          cancel-txt="搜索"
          hide-cancel
          @search="handleSearch"
          @clear="handleSearch"
        />
      </view>
      <view class="tip-bar">
        请及时维护联系人信息
      </view>
    </view>

    <!-- 列表区域 -->
    <view class="list-container">
      <view v-if="total > 0" class="result-count">
        共找到 {{ total }} 条结果
      </view>

      <view class="card-list">
        <view
          v-for="(item, index) in contactList"
          :key="item.id || index"
          class="contact-card"
          @click="showDetail(item)"
        >
          <!-- 第一行：姓名+职位 + 电话 -->
          <view class="card-row header-row">
            <view class="name-box">
              <text class="name">{{ item.contactName }}</text>
              <text v-if="item.post" class="post">({{ item.post }})</text>
            </view>
            <text class="phone">{{ item.contactPhone }}</text>
          </view>

          <!-- 第二行：公司名 + 拨号图标 -->
          <view class="card-row company-row">
            <!-- 暂时没有 store 或 API 返回公司名，使用 customerId 占位或根据后续需求修改，这里暂时隐藏或显示默认 -->
            <text class="company">{{ item.customerName || '未知公司' }}</text>

            <CKIcon
              line-height="40rpx"
              name="phone"
              size="40px"
              @click.stop.prevent="handlePhone(item)"
            />
          </view>

          <!-- 第三行：备注 -->
          <view class="card-row remark-row">
            <text class="remark">备注：{{ item.remark || '-' }}</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="contactList.length === 0 && !isLoading" class="empty-state">
          暂无联系人数据
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <wd-popup
      v-model="showPopup"
      position="bottom"
      closable
      custom-style="border-radius: 16px 16px 0 0; max-height: 80vh;"
    >
      <view class="popup-content">
        <view class="popup-header">
          <text class="title">更多信息</text>
        </view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">联系人姓名</text>
            <view class="value">
              {{ currentItem.contactName }}
              <text v-if="currentItem.post">({{ currentItem.post }})</text>
            </view>
          </view>
          <view class="info-item">
            <text class="label">联系人电话</text>
            <text class="value">{{ currentItem.contactPhone }}</text>
          </view>
          <view class="info-item" @click="handleGoCustomerDetail">
            <text class="label">所属公司</text>
            <text class="value active">
              {{ currentItem.customerName || '未知公司' }}
            </text>
          </view>
          <view class="info-item">
            <text class="label">邮箱</text>
            <text class="value">{{ currentItem.email || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="label">微信</text>
            <text class="value">{{ currentItem.wechat || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="label">QQ</text>
            <text class="value">{{ currentItem.qq || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="label">备注</text>
            <text class="value">{{ currentItem.remark || '-' }}</text>
          </view>
        </view>
      </view>
    </wd-popup>

    <!-- 电话拨打和跟进组件 - 懒加载 -->
    <PhoneCallFollowUp v-if="shouldLoadPhoneComponent" ref="phoneCallFollowUpRef" />
  </view>
</template>

<script setup lang="ts">
import type { ContactItem } from '@/pages-mcm/common/type'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import CKIcon from '@/pages-mcm/components/CKIcon/CKIcon.vue'
import PhoneCallFollowUp from '@/pages-mcm/components/PhoneCallFollowUp/PhoneCallFollowUp.vue'

import { mcmCustomerContactList } from '@/pages-mcm/service/customer'
import { handleGeneralBack } from '@/utils/function'

defineOptions({
  name: 'CustomerContact',
})
definePage({
  style: {
    navigationStyle: 'custom',
  },
})

// --- 状态 ---
const searchValue = ref('')
const contactList = ref<ContactItem[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false)

// 弹窗相关
const showPopup = ref(false)
const currentItem = ref<ContactItem>({} as ContactItem)

// 电话拨打组件引用和懒加载控制
const phoneCallFollowUpRef = ref()
const shouldLoadPhoneComponent = ref(false)

// --- 生命周期 ---
onLoad(() => {
  fetchData()
})

onReachBottom(() => {
  if (contactList.value.length < total.value && !isLoading.value) {
    pageNum.value++
    fetchData()
  }
})

// --- 方法 ---
function handleSearch() {
  pageNum.value = 1
  contactList.value = []
  fetchData()
}

function showDetail(item: ContactItem) {
  currentItem.value = item
  showPopup.value = true
}

async function fetchData() {
  if (isLoading.value)
    return
  isLoading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      pmQueryCriteria: searchValue.value,
    }
    const res = (await mcmCustomerContactList(params)) as any
    const list = res.data?.list || []
    const totalCount = res.data?.total || 0

    if (pageNum.value === 1) {
      contactList.value = list
    }
    else {
      contactList.value = [...contactList.value, ...list]
    }
    total.value = totalCount
  }
  catch (e) {
    console.error('获取联系人失败', e)
    uni.showToast({ title: '获取联系人失败', icon: 'none' })
  }
  finally {
    isLoading.value = false
  }
}

// 拨打电话
function handlePhone(item: any) {
  // 首次调用时加载组件
  if (!shouldLoadPhoneComponent.value) {
    shouldLoadPhoneComponent.value = true
    // 等待组件渲染完成后再调用方法
    nextTick(() => {
      phoneCallFollowUpRef.value?.makeCall({
        contactPhone: item.contactPhone,
        id: item.customerId,
      })
    })
  }
  else {
    phoneCallFollowUpRef.value?.makeCall({
      contactPhone: item.contactPhone,
      id: item.customerId,
    })
  }
}

function handleGoCustomerDetail() {
  uni.navigateTo({
    url: `/pages-mcm/customer/customerDetails?id=${currentItem.value.customerId}`,
  })
}
</script>

<style lang="scss" scoped>
.contact-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.header-section {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-container {
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
}

.tip-bar {
  padding: 8px 16px;
  background-color: #fff;
  font-size: 12px;
  color: #999;
}

.result-count {
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
}

.list-container {
  margin-top: 12px;
  padding: 0 16px;
}

.contact-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;

  .card-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .header-row {
    justify-content: space-between;

    .name-box {
      display: flex;
      align-items: center;

      .name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        margin-right: 4px;
      }

      .post {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
    }

    .phone {
      font-size: 14px;
      color: #333;
      font-weight: 500; // 稍微加粗一点
    }
  }

  .company-row {
    justify-content: space-between;

    .company {
      font-size: 14px;
      color: #666;
      word-break: break-all;
    }
  }

  .remark-row {
    .remark {
      font-size: 14px;
      color: #666;
      word-break: break-all;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

// 弹窗样式
.popup-content {
  background-color: #fff;
  padding: 0 16px 30px;

  .popup-header {
    padding: 16px 0;
    text-align: left;
    border-bottom: 1px solid #f5f5f5;

    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }

  .info-list {
    padding-top: 10px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f9f9f9;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 14px;
        color: #999;
        width: 100px;
      }

      .value {
        flex: 1;
        text-align: right;
        font-size: 14px;
        color: #333;

        &.active {
          color: #2979ff;
        }
      }
    }
  }
}

// 确认弹窗样式
.confirm-popup {
  background: #fff;
  padding: 30px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .icon-area {
    margin-bottom: 16px;

    .warn-icon {
      width: 50px;
      height: 50px;
      background-color: #f0ad4e;
      border-radius: 50%;
      color: #fff;
      font-size: 32px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .confirm-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }

  .confirm-desc {
    font-size: 14px;
    color: #999;
    text-align: center;
    margin-bottom: 24px;
  }

  .confirm-btns {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .btn {
      width: 45%;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      border-radius: 4px;

      &.cancel {
        background-color: #fff;
        border: 1px solid #ddd;
        color: #666;
      }

      &.primary {
        background-color: #409eff; // 或 #2979ff
        color: #fff;
        border: none;
      }

      &::after {
        border: none;
      }
    }
  }
}

// 新增跟进弹窗样式
.add-follow-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;

  .add-header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #eee;

    .title {
      font-size: 16px;
      font-weight: bold;
    }

    .close-txt {
      font-size: 14px;
      color: #666;
    }
  }

  .form-scroll {
    flex: 1;
    padding: 16px;
    box-sizing: border-box;
    // scroll-view 需要设置高度才能滚动，或者 felx: 1 在 column 中生效
    overflow-y: auto;
  }

  .form-item {
    margin-bottom: 20px;

    .label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;

      &.required::before {
        content: '*';
        color: red;
        margin-right: 2px;
      }
    }

    .textarea-box {
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 10px;
      position: relative;

      .input-area {
        width: 100%;
        height: 100px;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
      }

      .word-count {
        text-align: right;
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .form-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f9f9f9;

    .label {
      font-size: 14px;
      color: #333;

      &.required::before {
        content: '*';
        color: red;
        margin-right: 2px;
      }
    }

    .value-picker,
    .value-text {
      font-size: 14px;
      color: #333;
    }

    .value-placeholder {
      font-size: 14px;
      color: #999;
    }

    .radio-group {
      display: flex;

      .radio-item {
        display: flex;
        align-items: center;
        margin-left: 20px;

        .radio-circle {
          width: 16px;
          height: 16px;
          border: 1px solid #ccc;
          border-radius: 50%;
          margin-right: 6px;
          position: relative;

          &.checked {
            border-color: #2979ff;

            &::after {
              content: '';
              position: absolute;
              width: 8px;
              height: 8px;
              background-color: #2979ff;
              border-radius: 50%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }

        text {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }

  .form-footer {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #eee;
    background-color: #fff;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));

    .footer-btn {
      width: 48%;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      border-radius: 4px;

      &.cancel {
        background-color: #f5f5f5;
        color: #666;
        border: none;
      }

      &.save {
        background-color: #409eff;
        color: #fff;
        border: none;
      }

      &::after {
        border: none;
      }
    }
  }
}
</style>
