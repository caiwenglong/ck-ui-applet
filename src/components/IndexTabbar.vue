<template>
  <wd-tabbar
    v-model="tabbarValue"
    :bordered="false"
    safe-area-inset-bottom
    fixed
    shape="round"
    @change="change"
  >
    <wd-tabbar-item icon="home" title="首页" />
    <!--    <wd-tabbar-item :value="0" icon="chat1" title="消息"></wd-tabbar-item> -->
    <wd-tabbar-item icon="user" title="我的" />
  </wd-tabbar>
</template>

<script setup>
import { onLoad, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import useCommonStore from '@/store/common'

const tabUrl = {
  0: '/pages/index/index',
  // 1: '/pages/message/index',
  1: '/pages/my/index',
}

const commonStore = useCommonStore()
const { tabbarValue } = storeToRefs(commonStore)

function change({ value }) {
  uni.switchTab({
    url: tabUrl[value],
  })
}

onLoad(() => {
  uni.hideTabBar({
    fail: () => {},
  })
})

onShow(() => {})
</script>

<style lang="scss"></style>
