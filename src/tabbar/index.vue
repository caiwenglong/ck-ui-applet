<script setup lang="ts">
import { computed } from 'vue'
import { customTabbarEnable, needHideNativeTabbar, tabbarCacheEnable } from './config'
import { getI18nText, setTabbarItem } from './i18n'
import { tabbarList, tabbarStore } from './store'

// #ifdef MP-WEIXIN
// 将自定义节点设置成虚拟的（去掉自定义组件包裹层），更加接近Vue组件的表现
defineOptions({
  virtualHost: true,
})
// #endif

/** 当前选中的 tabbar value（pagePath），单向绑定给 t-tab-bar 的 :value */
const currentValue = computed(() => tabbarStore.curValue)

/**
 * 获取 badge-props（TDesign BadgeProps 格式）
 */
function getBadgeProps(item: (typeof tabbarList.value)[number]) {
  if (!item.badge)
    return {}
  if (item.badge === 'dot') {
    return { dot: true }
  }
  return { count: item.badge, maxCount: 99 }
}

/**
 * tabbar 切换事件
 * TDesign t-tab-bar 的 change 事件传递 { value } 对象
 */
function handleChange(val: string | { value: string }) {
  const value = typeof val === 'string' ? val : val.value

  tabbarStore.setCurValue(value)
  if (tabbarCacheEnable) {
    uni.switchTab({ url: value })
  }
  else {
    uni.navigateTo({ url: value })
  }
}

// #ifndef MP-WEIXIN || MP-ALIPAY
// 因为有了 custom:true，微信里面不需要多余的hide操作
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  needHideNativeTabbar
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
  })
})
// #endif

// #ifdef MP-ALIPAY
onMounted(() => {
  // 解决支付宝自定义tabbar 未隐藏导致有2个 tabBar 的问题
  customTabbarEnable
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
  })
})
// #endif

// 注意，上面处理的是自定义tabbar，下面处理的是原生tabbar，参考：https://unibest.tech/base/10-i18n
onShow(() => {
  setTabbarItem()
})
</script>

<template>
  <view v-if="customTabbarEnable" class="tabbar-placeholder">
    <t-tab-bar
      :value="currentValue"
      :fixed="true"
      :placeholder="false"
      :safe-area-inset-bottom="true"
      :bordered="false"
      shape="round"
      @change="handleChange"
    >
      <t-tab-bar-item
        v-for="(item, index) in tabbarList"
        :key="index"
        :icon="item.icon"
        :value="item.pagePath"
        :badge-props="getBadgeProps(item)"
      >
        {{ getI18nText(item.text) }}
      </t-tab-bar-item>
    </t-tab-bar>
  </view>
</template>

<style scoped lang="scss">
.tabbar-placeholder {
  // 占位高度，避免页面内容被 tabbar 遮挡
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
