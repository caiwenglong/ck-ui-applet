<!--
  * @description other - 开发模式
-->
<route lang="json5" type="page">
{
  style: {
    navigationBarTitleText: '开发模式',
  },
}
</route>

<script lang="ts" setup>
import useCommonStore from '@/store/common'

import { useTokenStore } from '@/store/token'

const tokenStore = useTokenStore()
const model = reactive<{
  username: string
  password: string
}>({
  username: 'admin',
  password: 'ckck123',
})
const form = ref()
const commonStore = useCommonStore()

function handleSubmit() {
  form.value.validate().then(async ({ valid }) => {
    if (valid) {
      console.log('校验通过')
      await tokenStore.userH5Login(model)
      await uni.showToast({
        title: '登录成功',
        icon: 'none',
        duration: 1000,
      })
      setTimeout(() => {
        commonStore.setTabbarValue(0)
        uni.switchTab({ url: '/pages/index/index' })
      }, 1000)
      // const { query } = currRoute()
      // uni.redirectTo({ url: query.redirect })
    }
  })
}
</script>

<template>
  <view>
    <wd-form ref="form" :model="model">
      <wd-cell-group border>
        <wd-input
          v-model="model.username"
          :rules="[{ required: true, message: '请填写用户名' }]"
          clearable
          label="用户名"
          label-width="100px"
          placeholder="请输入用户名"
          prop="username"
        />
        <wd-input
          v-model="model.password"
          :rules="[{ required: true, message: '请填写密码' }]"
          clearable
          label="密码"
          label-width="100px"
          placeholder="请输入密码"
          prop="password"
          show-password
        />
      </wd-cell-group>
      <view class="footer">
        <wd-button block size="large" type="primary" @click="handleSubmit">
          提交
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<style lang="scss" scoped></style>
