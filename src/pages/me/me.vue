<!--
  * @description ocm - 个人中心 - 首页
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import IndexTabbar from '@/components/IndexTabbar.vue'
import { usePageOnce } from '@/hooks/usePageOnce'
import { useSecretTap } from '@/hooks/useSecretTap'
import { httpGet } from '@/http/http'

const toast = useToast()

const src = 'https://ckscm-dev.oss-cn-hangzhou.aliyuncs.com/avatar/default_avatar.png'

const userInfo = ref<any>({
  sysUser: {},
})
// 获取个人信息
async function getUserInfo() {
  const res = await httpGet('/system/user/profile')
  console.log('个人信息', res)
  userInfo.value = res.data
}

const { handleTap } = useSecretTap(() => {
  toast.success('即将进入开发者模式')
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages-other/developer/index',
    })
  }, 1000)
})

usePageOnce(
  () => {
    getUserInfo()
  },
  () => {
    getUserInfo()
  },
)
</script>

<template>
  <view class="my_box">
    <!-- 头像 -->
    <view class="avatar_box">
      <view class="avatar_content">
        <wd-img
          :enable-preview="true"
          :height="100"
          :src="userInfo.sysUser.avatar || src"
          :width="100"
          round
        />
        <view class="user_name" @click="handleTap">
          <text>{{ userInfo.sysUser.userName }}</text>
        </view>
      </view>
    </view>

    <!-- 用户信息 -->
    <view class="user_info_box">
      <wd-cell-group border title="角色信息">
        <wd-cell :value="userInfo.roleGroup" title="角色" vertical />
      </wd-cell-group>

      <wd-cell-group border title="个人信息">
        <wd-cell :value="userInfo.sysUser.phonenumber" title="手机号码" vertical />
        <wd-cell :value="userInfo.sysUser.email || '-'" title="邮箱" vertical />
        <!-- <wd-cell :value="dict('sys_user_sex', userInfo.sysUser.sex)" title="性别" vertical /> -->
      </wd-cell-group>
    </view>
  </view>

  <IndexTabbar />
</template>

<style>
page {
  background: #eae6ff;
}
</style>

<style lang="scss" scoped>
.my_box {
  padding: 0 20rpx;
  overflow-y: hidden;

  .avatar_box {
    margin-top: 150rpx;

    .avatar_content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: -140rpx;

      .user_name {
        margin-top: 20rpx;
        color: #172b4d;
      }
    }
  }

  .user_info_box {
    padding-top: 180rpx;
    background: #fff;
    height: 400px;
    border-radius: 20rpx;
    padding-bottom: 90rpx;
  }
}
</style>
