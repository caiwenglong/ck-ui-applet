<template>
  <div class="ck-icon">
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
  },
  data() {
    return {
      url: 'https://ckscm-dev.oss-cn-hangzhou.aliyuncs.com/test/mobile/',
    }
  },
}
</script>

<style scoped>
.ck-icon {
  display: flex;
}
</style>
