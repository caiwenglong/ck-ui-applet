<!--
  * @description mcm - 客户创建成功完成页
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="success-page">
    <!--  内容区域  -->
    <view class="content-wrapper">
      <!-- 成功图标 -->
      <view class="success-icon-wrapper">
        <view class="success-icon">
          <wd-icon name="check" size="40px" color="#ffffff" />
        </view>
      </view>

      <!-- 成功提示文字 -->
      <view class="success-text">
        创建成功
      </view>

      <!-- 操作按钮 -->
      <view class="button-group">
        <wd-button
          class="continue-btn"
          size="large"
          type="primary"
          @click="handleContinueCreate"
        >
          继续新建
        </wd-button>
        <wd-button
          class="detail-btn"
          size="large"
          plain
          @click="handleViewDetail"
        >
          查看详情
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'

// 路由参数
const routeOptions = ref<{ customerId?: string }>({})

// 继续新建
function handleContinueCreate() {
  // 跳转到新增客户页面（替换当前页面）
  uni.redirectTo({
    url: '/pages-mcm/customer/customerAddOrUpdate',
  })
}

// 查看详情
function handleViewDetail() {
  if (!routeOptions.value.customerId) {
    uni.showToast({ title: '缺少客户ID', icon: 'none' })
    return
  }
  // 跳转到客户详情页面
  uni.redirectTo({
    url: `/pages-mcm/customer/customerDetails?id=${routeOptions.value.customerId}`,
  })
}

// 页面加载时获取路由参数
onLoad((options) => {
  routeOptions.value = options || {}
})
</script>

<style>
page {
  background: #ffffff;
}
</style>

<style lang="scss" scoped>
.success-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.success-icon-wrapper {
  margin-bottom: 40rpx;
}

.success-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-text {
  font-size: 36rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 80rpx;
}

.button-group {
  display: flex;
  gap: 24rpx;
  width: 100%;
  max-width: 600rpx;
  justify-content: center;
}

.continue-btn {
  flex: 1;
}

.detail-btn {
  flex: 1;
}
</style>
