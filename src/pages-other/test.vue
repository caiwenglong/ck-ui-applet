<template>
  <view>
    <view>我是测试页面</view>

    <wd-select-picker
      v-model="assistantIdsValue"
      :columns="userList"
      label-key="label"
      value-key="value"
      filterable
      label="协助人"
      label-width="120px"
      placeholder="请选择协助人"
      prop="assistantIds"
      type="checkbox"
    />

    <button @click="handleTest">
      确定
    </button>
  </view>
</template>

<script lang="ts" setup>
// 获取用户列表
import { httpGet } from '@/http/http'

const assistantIdsValue = ref<any[]>([])
const userList = ref<any[]>([])
async function getUserList() {
  try {
    const { data } = await httpGet<IResData<any>>('/system/user/list/role/mcmSalesman,mcmManager')
    userList.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      label: item.userName,
      value: item.userId,
    }))
  }
  catch (e) {
    console.error('获取用户列表失败', e)
  }
}

function handleTest() {
  console.log('assistantIdsValue', assistantIdsValue.value)
}

getUserList()
</script>

<style scoped></style>
