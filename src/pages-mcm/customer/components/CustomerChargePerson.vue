<!--
  * @description 客户负责人组件
-->
<template>
  <wd-cell-group border>
    <!-- 负责人：编辑状态时只读，显示 salesmanName -->
    <wd-cell
      v-if="isEdit"
      title="负责人"
      :value="model.salesmanName || '未设置'"
      title-width="120px"
      readonly
    />
    <wd-picker
      v-else
      v-model="model.salesmanId"
      :columns="userList"
      label="负责人"
      label-width="120px"
      placeholder="请选择负责人"
      prop="salesmanId"
    />
    <!-- 协助人：多选 -->
    <wd-select-picker
      v-model="assistantIdsValue"
      :columns="userList"
      label="协助人"
      label-width="120px"
      placeholder="请选择协助人"
      prop="assistantIds"
      type="checkbox"
      filterable
    />
  </wd-cell-group>
</template>

<script lang="ts" setup>
import type { ChargePersonInfo } from '@/pages-mcm/type/customer'
import { httpGet } from '@/http/http'
import { useUserStore } from '@/store'

const props = defineProps<{
  modelValue: ChargePersonInfo & { [key: string]: any }
  isEdit?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ChargePersonInfo & { [key: string]: any }]
}>()

const model = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 判断是否为编辑状态
const isEdit = computed(() => props.isEdit ?? false)

// 协助人字段：需要处理字符串和数组两种格式
const assistantIdsValue = computed({
  get: () => {
    const value = model.value.assistantIds
    if (!value)
      return []
    // 如果是字符串，转换为数组
    if (typeof value === 'string') {
      // 可能是逗号分隔的字符串
      return value.split(',').map((item: string) => Number(item))
    }
    return Array.isArray(value) ? value : []
  },
  set: (val: string[]) => {
    // 将数组转换为逗号分隔的字符串
    model.value.assistantIds = val.length > 0 ? val.join(',') : ''
  },
})

const userList = ref<Array<{ label: string, value: string }>>([])

const userStore = useUserStore()

// 设置默认负责人为当前用户
function setDefaultSalesman() {
  // 如果不是编辑状态且负责人为空，则默认设置为当前用户
  if (!isEdit.value && !model.value.salesmanId) {
    const currentUserId = userStore.userInfoData?.userId
    if (currentUserId) {
      // 检查当前用户是否在用户列表中
      const existsInList = userList.value.some(user => user.value === currentUserId)
      console.log('existsInList', existsInList)
      console.log('userList.value', userList.value)
      // 只有当当前用户在列表中时，才设置默认值
      if (existsInList) {
        model.value.salesmanId = currentUserId
      }
    }
  }
}

// 获取用户列表
async function getUserList() {
  try {
    const { data } = await httpGet<IResData<any>>('/system/user/list/role/mcmSalesman,mcmManager')
    userList.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      label: item.userName,
      value: item.userId,
    }))
    // 用户列表加载完成后，设置默认负责人
    setDefaultSalesman()
  }
  catch (e) {
    console.error('获取用户列表失败', e)
  }
}

onMounted(() => {
  getUserList()
})
</script>

<style lang="scss" scoped></style>
