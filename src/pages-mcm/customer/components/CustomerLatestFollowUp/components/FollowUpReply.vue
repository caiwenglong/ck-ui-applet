<!--
  * @description 回复评论弹窗组件
-->
<template>
  <wd-popup
    v-model="visible"
    position="bottom"
    :custom-style="popupStyle"
    @close="handleClose"
  >
    <view class="reply-popup">
      <view class="reply-header">
        <text class="reply-title">回复</text>
        <text class="reply-close" @click="handleClose">取消</text>
      </view>
      <view class="reply-content">
        <wd-textarea
          v-model="content"
          :placeholder="placeholder"
          :maxlength="500"
          show-word-limit
          :auto-height="true"
          :min-height="200"
          :adjust-position="false"
          custom-class="reply-textarea"
          @focus="handleTextareaFocus"
          @blur="handleTextareaBlur"
        />
      </view>
      <view class="reply-footer">
        <button class="reply-button" @click="handleSubmit">
          发送
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [content: string]
  'close': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const content = ref('')
const keyboardHeight = ref(0)

// 计算弹窗样式
const popupStyle = computed(() => {
  const baseStyle = 'border-radius: 16px 16px 0 0; z-index: 1000;'
  if (keyboardHeight.value > 0) {
    // 键盘弹起时，设置 bottom 值，让弹窗上移
    return `${baseStyle} bottom: ${keyboardHeight.value}px; transition: bottom 0.25s ease-out;`
  }
  return `${baseStyle} transition: bottom 0.25s ease-out;`
})

// 监听键盘高度变化
let keyboardHeightChangeCallback: ((res: { height: number }) => void) | null = null

// 初始化键盘监听
function initKeyboardListener() {
  try {
    // 使用 uni.onKeyboardHeightChange，uni-app 会自动判断平台
    if ((uni as any).onKeyboardHeightChange) {
      keyboardHeightChangeCallback = (res: { height: number }) => {
        keyboardHeight.value = res.height || 0
      }
      ;(uni as any).onKeyboardHeightChange(keyboardHeightChangeCallback)
    }
  }
  catch (e) {
    console.log('键盘监听初始化失败', e)
  }
}

// 移除键盘监听
function removeKeyboardListener() {
  try {
    if (keyboardHeightChangeCallback && (uni as any).offKeyboardHeightChange) {
      ;(uni as any).offKeyboardHeightChange(keyboardHeightChangeCallback)
    }
  }
  catch (e) {
    console.log('移除键盘监听失败', e)
  }
  keyboardHeightChangeCallback = null
}

onMounted(() => {
  initKeyboardListener()
})

onUnmounted(() => {
  removeKeyboardListener()
})

// 处理输入框聚焦（uni-app 会自动触发键盘高度监听，这里不需要额外处理）
function handleTextareaFocus() {
  // uni-app 会自动触发键盘高度监听，无需手动处理
}

// 处理输入框失焦
function handleTextareaBlur() {
  // 延迟重置，避免键盘收起动画时的闪烁
  setTimeout(() => {
    keyboardHeight.value = 0
  }, 100)
}

// 监听弹窗显示/隐藏，重置内容
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // 弹窗打开时，重新初始化键盘监听（确保监听是活跃的）
      nextTick(() => {
        // 先移除旧的监听
        removeKeyboardListener()
        // 重新初始化
        initKeyboardListener()
      })
    }
    else {
      content.value = ''
      // 弹窗关闭时重置键盘高度
      keyboardHeight.value = 0
    }
  },
)

// 关闭弹窗
function handleClose() {
  visible.value = false
  content.value = ''
  emit('close')
}

// 提交回复
function handleSubmit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入回复内容', icon: 'none' })
    return
  }
  emit('submit', content.value.trim())
}
</script>

<style lang="scss" scoped>
.reply-popup {
  background-color: #fff;
  padding: 0 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));

  .reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 0;
    border-bottom: 1px solid #eee;

    .reply-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .reply-close {
      font-size: 28rpx;
      color: #666;
    }
  }

  .reply-content {
    padding: 32rpx 0;

    // 去掉 textarea 的边框
    :deep(.reply-textarea) {
      border: none !important;

      .wd-textarea__inner {
        border: none !important;
        border-bottom: none !important;
      }

      .wd-textarea__value {
        border: none !important;
        border-bottom: none !important;
      }
    }
  }

  .reply-footer {
    padding-top: 24rpx;
    border-top: 1px solid #eee;

    .reply-button {
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
