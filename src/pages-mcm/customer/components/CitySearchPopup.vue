<template>
  <wd-popup
    :model-value="modelValue"
    :safe-area-inset-bottom="true"
    :z-index="2000"
    custom-style="height: 50vh;"
    position="bottom"
    @update:model-value="handleUpdateVisible"
  >
    <view class="city_search_popup">
      <view class="city_search_header">
        <text class="city_search_title">城市搜索</text>
        <view class="city_search_close" @click="handleClose">
          <text>✕</text>
        </view>
      </view>
      <view class="city_search_content">
        <wd-input
          v-model="citySearchInput"
          clearable
          placeholder="请输入城市名称"
          @confirm="handleConfirm"
        />
        <view v-if="recentSearches.length > 0" class="recent_searches">
          <text class="recent_searches_title">最近搜索</text>
          <view class="recent_searches_tags">
            <view
              v-for="(item, index) in recentSearches"
              :key="index"
              :class="{ active: citySearchInput === item }"
              class="recent_search_tag"
              @click="selectRecentSearch(item)"
            >
              {{ item }}
            </view>
          </view>
        </view>
      </view>
      <view class="city_search_footer">
        <wd-button custom-class="city_search_reset_btn" plain @click="handleReset">
          重置
        </wd-button>
        <wd-button custom-class="city_search_submit_btn" type="primary" @click="handleSubmit">
          搜索
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  value?: string // 当前搜索值
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [keyword: string]
  'reset': []
}>()

const citySearchInput = ref('')
const recentSearches = ref<string[]>([])
const STORAGE_KEY = 'customer_city_recent_searches'

// 加载最近搜索
function loadRecentSearches() {
  try {
    const stored = uni.getStorageSync(STORAGE_KEY)
    if (stored && Array.isArray(stored)) {
      recentSearches.value = stored
    }
  }
  catch (e) {
    console.error('加载最近搜索失败', e)
  }
}

// 保存最近搜索（最多10个）
function saveRecentSearch(keyword: string) {
  if (!keyword || keyword.trim() === '')
    return

  const trimmedKeyword = keyword.trim()
  // 移除已存在的相同关键词
  recentSearches.value = recentSearches.value.filter((item: string) => item !== trimmedKeyword)
  // 添加到最前面
  recentSearches.value.unshift(trimmedKeyword)
  // 只保留最近10个
  if (recentSearches.value.length > 10) {
    recentSearches.value = recentSearches.value.slice(0, 10)
  }
  // 保存到本地存储
  try {
    uni.setStorageSync(STORAGE_KEY, recentSearches.value)
  }
  catch (e) {
    console.error('保存最近搜索失败', e)
  }
}

// 监听弹窗打开，初始化输入值
watch(
  () => props.modelValue,
  (visible: any) => {
    if (visible) {
      citySearchInput.value = props.value || ''
      loadRecentSearches()
    }
  },
  { immediate: true },
)

// 监听外部 value 变化
watch(
  () => props.value,
  (newValue: any) => {
    if (!props.modelValue) {
      citySearchInput.value = newValue || ''
    }
  },
)

// 选择最近搜索
function selectRecentSearch(keyword: string) {
  citySearchInput.value = keyword
}

// 关闭弹窗
function handleClose() {
  emit('update:modelValue', false)
  citySearchInput.value = props.value || ''
}

// 更新显示状态
function handleUpdateVisible(visible: boolean) {
  emit('update:modelValue', visible)
  if (!visible) {
    citySearchInput.value = props.value || ''
  }
}

// 重置搜索
function handleReset() {
  citySearchInput.value = ''
  emit('reset')
  handleClose()
}

// 确认搜索（回车）
function handleConfirm() {
  handleSubmit()
}

// 提交搜索
function handleSubmit() {
  const keyword = citySearchInput.value?.trim() || ''
  if (keyword) {
    saveRecentSearch(keyword)
  }
  emit('submit', keyword)
  handleClose()
}

// 初始化时加载最近搜索
loadRecentSearches()
</script>

<style lang="scss" scoped>
.city_search_popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;

  .city_search_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    border-bottom: 1px solid #f5f5f5;

    .city_search_title {
      font-size: 28rpx;
      font-weight: bold;
    }

    .city_search_close {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #666;
    }
  }

  .city_search_content {
    flex: 1;
    padding: 24rpx 30rpx;
    overflow-y: auto;

    :deep(.wd-input) {
      margin-bottom: 24rpx;
    }

    .recent_searches {
      .recent_searches_title {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 16rpx;
        display: block;
      }

      .recent_searches_tags {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .recent_search_tag {
          padding: 10rpx 20rpx;
          background: #f5f5f5;
          border-radius: 40rpx;
          font-size: 24rpx;
          color: #333;
          cursor: pointer;
          transition: all 0.3s;

          &.active {
            background: #e0f0ff;
            color: #5243aa;
          }
        }
      }
    }
  }

  .city_search_footer {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 30rpx;
    border-top: 1px solid #f5f5f5;
    justify-content: space-around;

    .city_search_reset_btn {
      flex: 1;
    }

    .city_search_submit_btn {
      flex: 1;
    }
  }
}
</style>
