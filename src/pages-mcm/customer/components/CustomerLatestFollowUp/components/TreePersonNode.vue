<!--
  * @description 树形人员选择节点组件（递归组件）
-->
<template>
  <view class="tree-node-wrapper">
    <view
      class="tree-node-item"
      :class="{ 'is-person': isPerson, 'is-dept': isDept }"
      :style="{ paddingLeft: `${level * 40}rpx` }"
      @click="isDept ? toggleExpand() : handleSelect()"
    >
      <view class="tree-node-content">
        <!-- 展开/收起图标 -->
        <view v-if="isDept && hasChildren" class="tree-expand-icon" @click.stop="toggleExpand">
          <text>{{ isExpanded ? '▼' : '▶' }}</text>
        </view>
        <view v-else class="tree-expand-placeholder" />

        <!-- 复选框（仅人员显示） -->
        <view v-if="isPerson" class="tree-checkbox" @click.stop="handleSelect">
          <view class="checkbox-circle" :class="[isSelected ? 'checked' : '']">
            <text v-if="isSelected" class="checkmark">✓</text>
          </view>
        </view>

        <!-- 节点名称 -->
        <text class="tree-node-name">{{ node.name }}</text>
      </view>
    </view>

    <!-- 子节点 -->
    <view v-if="isExpanded && hasChildren" class="tree-children">
      <TreePersonNode
        v-for="child in node.childOrgList"
        :key="child.id"
        :node="child"
        :selected-ids="selectedIds"
        :level="level + 1"
        @select="$emit('select', $event)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  node: any
  selectedIds: number[]
  level: number
}>()

const emit = defineEmits<{
  select: [id: number]
}>()

const isExpanded = ref(false)

const isPerson = computed(() => props.node.type === 2)
const isDept = computed(() => props.node.type === 1)
const isSelected = computed(() => {
  if (!isPerson.value)
    return false
  return props.selectedIds.includes(props.node.id)
})
const hasChildren = computed(() => {
  return props.node.childOrgList && props.node.childOrgList.length > 0
})

function toggleExpand() {
  if (isDept.value && hasChildren.value) {
    isExpanded.value = !isExpanded.value
  }
}

function handleSelect() {
  if (isPerson.value) {
    emit('select', props.node.id)
  }
}
</script>

<style lang="scss" scoped>
.tree-node-wrapper {
  .tree-node-item {
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &.is-person {
      background-color: #fafafa;
    }

    .tree-node-content {
      display: flex;
      align-items: center;

      .tree-expand-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #666;
        margin-right: 8px;
      }

      .tree-expand-placeholder {
        width: 24px;
        margin-right: 8px;
      }

      .tree-checkbox {
        margin-right: 8px;

        .checkbox-circle {
          width: 18px;
          height: 18px;
          border: 1px solid #ccc;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.checked {
            background-color: #2979ff;
            border-color: #2979ff;

            .checkmark {
              color: #fff;
              font-size: 12px;
            }
          }
        }
      }

      .tree-node-name {
        font-size: 14px;
        color: #333;
      }
    }
  }

  .tree-children {
    margin-left: 0;
  }
}
</style>
