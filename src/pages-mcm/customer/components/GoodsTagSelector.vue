<!--
  * @description 主营品名选择器（多选）：modelValue 为 goodsIds（id 逗号分隔），提交用 id；回显用 displayNames（goodsNames）
-->
<template>
  <view>
    <wd-cell
      :title="label"
      :title-width="labelWidth"
      :value="displayValue"
      :prop="prop"
      :clickable="true"
      custom-class="goods-tag-selector__cell"
      @click="openPopup"
    >
      <template #right-icon>
        <wd-icon name="arrow-right" custom-class="goods-tag-selector__arrow" />
      </template>
    </wd-cell>

    <wd-popup
      v-model="popupVisible"
      position="bottom"
      :safe-area-inset-bottom="true"
      custom-style="border-radius: 16px 16px 0 0; max-height: 80vh;"
      @close="handlePopupClose"
      @enter="handlePopupOpened"
    >
      <view class="goods-tag-selector-popup">
        <view class="popup-header">
          <text class="popup-title">选择主营品名</text>
        </view>

        <wd-search
          v-model="searchKeyword"
          placeholder="搜索品名"
          hide-cancel
          placeholder-left
        />

        <view class="add-row">
          <wd-input
            v-model="newTagName"
            placeholder="请输入新品名"
            clearable
            custom-class="add-input"
          />
          <wd-button type="primary" size="small" @click="handleAdd">
            新增品名
          </wd-button>
        </view>

        <scroll-view scroll-y class="tag-list">
          <view
            v-for="item in filteredList"
            :key="item.id"
            class="tag-item"
            :class="{ active: isItemSelected(item) }"
            @click="handleToggle(item)"
          >
            <text class="tag-label">{{ item.label }}</text>
            <wd-icon v-if="isItemSelected(item)" name="check" size="18px" class="tag-check" />
          </view>
          <view v-if="filteredList.length === 0" class="empty-state">
            <text>暂无品名</text>
          </view>
        </scroll-view>

        <view class="popup-footer">
          <wd-button type="primary" block @click="handleConfirm">
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { httpGet, httpPost } from '@/http/http'

export interface GoodsTagItem {
  id: string
  label: string
  [key: string]: any
}

const props = withDefaults(
  defineProps<{
    /** 选中的 id 串，逗号分隔（goodsIds），提交给后端用 */
    modelValue: string
    /** 后端返回的品名，仅用于回显（如 goodsNames） */
    displayNames?: string
    label?: string
    labelWidth?: string
    placeholder?: string
    prop?: string
    clearable?: boolean
  }>(),
  {
    label: '主营品名',
    labelWidth: '120px',
    placeholder: '请选择主营品名',
    prop: 'goodsIds',
    clearable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** 选中的名称串（逗号分隔），用于父组件回显 goodsNames */
  'update:displayNames': [value: string]
}>()

const { success: showSuccess, error: showError, loading: showLoading, close: closeToast } = useToast()

const popupVisible = ref(false)
const tagList = ref<GoodsTagItem[]>([])
const searchKeyword = ref('')
const newTagName = ref('')
const loading = ref(false)

/** 当前选中的 id 列表（modelValue = goodsIds，逗号分隔） */
const selectedIds = computed<string[]>(() => {
  const v = props.modelValue
  if (!v || !String(v).trim())
    return []
  return String(v)
    .split(',')
    .map((s: string) => s.trim())
    .filter((s): s is string => Boolean(s))
})

const selectedSet = computed(() => new Set(selectedIds.value))

/** 弹窗内是否选中：按 id 判断（modelValue 为 goodsIds） */
function isItemSelected(item: GoodsTagItem) {
  return selectedSet.value.has(item.id)
}

/** 单元格展示：仅回显用 displayNames（goodsNames），无则用 id 映射名称 */
const displayValue = computed(() => {
  if (props.displayNames != null && String(props.displayNames).trim()) {
    return props.displayNames.trim()
  }
  const ids = selectedIds.value
  if (ids.length === 0)
    return props.placeholder
  const names = ids.map((id) => {
    const found = tagList.value.find(t => t.id === id)
    return found ? found.label : id
  })
  return names.join(', ')
})

const filteredList = computed(() => {
  const list = tagList.value
  const kw = (searchKeyword.value || '').trim().toLowerCase()
  if (!kw)
    return list
  return list.filter(item => (item.label || '').toLowerCase().includes(kw))
})

/** 提交选中结果：id 给后端（goodsIds），名称给父组件回显（goodsNames） */
function emitSelection(ids: string[]) {
  emit('update:modelValue', ids.join(','))
  const names = ids
    .map(id => tagList.value.find(t => t.id === id)?.label)
    .filter(Boolean)
    .join(',')
  emit('update:displayNames', names)
}

async function fetchTagList() {
  if (loading.value)
    return
  loading.value = true
  try {
    const { data } = await httpGet<IResData<GoodsTagItem[] | any[]>>('/mcm/goods/tag/list')
    const raw = data
    tagList.value = raw.map((item: any) => ({
      id: String(item.value),
      label: item.label,
      ...item,
    })).filter((item: GoodsTagItem) => item.id && item.label)
  }
  catch (e) {
    console.error('获取主营品名列表失败', e)
    tagList.value = []
  }
  finally {
    loading.value = false
  }
}

function openPopup() {
  popupVisible.value = true
}

function handlePopupClose() {
  searchKeyword.value = ''
  newTagName.value = ''
}

function handlePopupOpened() {
  fetchTagList()
}

function handleToggle(item: GoodsTagItem) {
  const set = new Set<string>(selectedIds.value)
  if (set.has(item.id)) {
    set.delete(item.id)
  }
  else {
    set.add(item.id)
  }
  emitSelection(Array.from(set))
}

function handleConfirm() {
  popupVisible.value = false
}

async function handleAdd() {
  const name = (newTagName.value || '').trim()
  if (!name) {
    uni.showToast({ title: '请输入品名', icon: 'none' })
    return
  }
  try {
    await httpPost('/mcm/goods/tag', {
      goodsTag: name,
      tagClass: 'tag-class-blue',
    })
    showSuccess({ msg: '新增成功' })
    newTagName.value = ''
    await fetchTagList()
    const added = tagList.value.find(t => t.label === name)
    const next = new Set<string>(selectedIds.value)
    if (added && !next.has(added.id))
      next.add(added.id)
    emitSelection(Array.from(next))
  }
  catch (e) {
    console.error('新增品名失败', e)
    showError({ msg: '新增失败' })
  }
}
</script>

<style lang="scss" scoped>
.goods-tag-selector-popup {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  max-height: 80vh;
}

.popup-header {
  padding: 32rpx;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;

  .popup-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1f1f1f;
  }
}

.add-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;

  .add-input {
    flex: 1;
  }
}

.tag-list {
  flex: 1;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 0 32rpx 24rpx;
}

.popup-footer {
  flex-shrink: 0;
  padding: 24rpx 32rpx 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;

  &.active {
    color: #0089ff;
  }

  .tag-label {
    flex: 1;
    font-size: 28rpx;
    color: #1f1f1f;
  }

  .tag-check {
    flex-shrink: 0;
    margin-left: 8rpx;
    color: #0089ff;
  }
}

.empty-state {
  padding: 80rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

:deep(.goods-tag-selector__arrow) {
  margin-left: 8rpx;
}
</style>
