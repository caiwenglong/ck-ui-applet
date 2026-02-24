<template>
  <div
    :style="lineHeight ? { lineHeight } : null"
    class="ck-icon" :class="[customClass]"
    @tap.stop.prevent="handleClick"
    @click.stop.prevent="handleClick"
  >
    <wd-icon :name="`${url + name}.png`" :size="size" />
  </div>
</template>

<script>
export default {
  name: 'AIcon',
  props: {
    name: {
      type: String,
      require: true,
    },
    size: {
      type: String,
      default: '32rpx',
    },
    // 接收 line-height
    lineHeight: {
      type: String,
    },
    // 自定义类名
    customClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      url: 'https://ckscm-dev.oss-cn-hangzhou.aliyuncs.com/test/mobile/',
    }
  },
  methods: {
    handleClick(event) {
      // 在小程序端阻止冒泡，避免触发父级卡片的跳转
      if (event && typeof event.stopPropagation === 'function')
        event.stopPropagation()
      if (event && typeof event.preventDefault === 'function')
        event.preventDefault()
      this.$emit('click', event)
    },
  },
}
</script>

<style scoped>
.ck-icon {
  display: flex;
}
</style>
