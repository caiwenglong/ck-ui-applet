<!--
  * @description 添加跟进信息确认弹窗组件
-->
<template>
  <wd-popup v-model="visible" custom-style="border-radius: 16px; width: 600rpx;">
    <view class="confirm-popup">
      <view class="icon-area">
        <view class="warn-icon">
          !
        </view>
      </view>
      <view class="confirm-title">
        添加一条跟进信息
      </view>
      <view class="confirm-desc">
        将必要信息录入跟进，方便后续查阅。
      </view>
      <view class="confirm-btns">
        <button class="btn cancel" @click="handleCancel">
          暂不
        </button>
        <button class="btn primary" @click="handleConfirm">
          新建跟进
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  customerId?: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 取消操作
function handleCancel() {
  visible.value = false
}

// 确认操作
function handleConfirm() {
  visible.value = false
  // 跳转到跟进记录列表页面
  const customerId = props.customerId
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
    gap: 16px;

    .btn {
      flex: 1;
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
