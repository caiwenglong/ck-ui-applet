<script lang="ts" setup>
// 获取屏幕边界到安全区域距离
import { onShow } from '@dcloudio/uni-app'
import CKIcon from '@/components/CKIcon/CKIcon.vue'
import IndexTabbar from '@/components/IndexTabbar.vue'
import { exchangeRatePageListByLatest } from '@/service/common'
import { useCountryRegionStore, useDictStore, useUserStore } from '@/store'

defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const userStore = useUserStore()
const dictStore = useDictStore()
const countryRegionStore = useCountryRegionStore()

const navbarActive = ref(1)
onPageScroll((e) => {
  if (e.scrollTop > 20) {
    navbarActive.value = 0
  }
  else if (e.scrollTop < 20) {
    navbarActive.value = 1
  }
})

// 在 script 标签内添加类型定义
interface ExchangeRateItem {
  currencyCode: string
  realTimeExchangeRate: number
  chargeExchangeRate: number
}

const dataList = ref<ExchangeRateItem[]>([])

// 请求汇率数据
async function getExchangeRatePageListByLatest() {
  const { data } = await exchangeRatePageListByLatest()
  dataList.value = data
}

// 获取用户信息
async function handleGetUserInfo() {
  await userStore.fetchUserInfo()
}

onShow(() => {
  getExchangeRatePageListByLatest()
  handleGetUserInfo()
  dictStore.getDict()
  countryRegionStore.aGetCountryRegion()
})

const searchValue = ref('')
function handleGoToSearchPage() {
  uni.navigateTo({
    url: `/pages-mcm/mcmSearch/index?searchValue=${searchValue.value}`,
  })
}
</script>

<template>
  <view class="page-index">
    <!--  标题  -->
    <view :style="{ opacity: navbarActive }" class="navbar-wrapper">
      <wd-navbar
        :bordered="false"
        title="宸坤供应链"
        custom-style="background-color: transparent !important;"

        placeholder safeareainsettop fixed
      />
    </view>

    <!-- 搜索栏 -->
    <view class="search-container">
      <wd-search
        v-model="searchValue"
        placeholder="搜索客户、订单、联系人"
        hide-cancel
        @search="handleGoToSearchPage"
      />
    </view>

    <view class="module_box">
      <wd-grid clickable :column="4" :gutter="10">
        <wd-grid-item
          link-type="navigateTo"
          text="客户管理"
          url="/pages-mcm/customer/index"
          use-icon-slot
        >
          <template #icon>
            <CKIcon name="customer" size="30px" />
          </template>
        </wd-grid-item>

        <wd-grid-item
          link-type="navigateTo"
          text="联系人查看"
          url="/pages-mcm/customerContact/index"
          use-icon-slot
        >
          <template #icon>
            <CKIcon name="msg_1" size="30px" />
          </template>
        </wd-grid-item>
      </wd-grid>
    </view>

    <view class="exchange_box">
      <wd-card>
        <template #title>
          <view class="exchange_title_box">
            <view class="flex" style="flex: 1; align-items: center">
              <view class="flex" style="align-items: center">
                <CKIcon class="align-items" name="exchangeRate_1" size="20px" />
                <text class="exchange_title align-items">实时汇率</text>
              </view>
            </view>
          </view>
        </template>
        <wd-table :border="false" :data="dataList" :stripe="false" height="400px">
          <wd-table-col align="center" label="币种" prop="currencyCode" width="35%" />
          <wd-table-col
            align="center"
            label="实时汇率"
            prop="exchangeRate"
            width="65%"
          />
        </wd-table>
        <template #footer>
          <view class="exchange_footer">
            <wd-icon name="mail" size="14px" />
            <text style="margin-left: 10rpx">来源：中国银行</text>
          </view>
        </template>
      </wd-card>
    </view>
  </view>

  <IndexTabbar />
</template>

<style lang="scss" scoped>
.page-index {
  //background-image: linear-gradient(to top, #f3e7e9 0%, #eae6ff 99%, #e3eeff 100%);
  background-image: linear-gradient(to top, #f3e7e9 0%, #e3eeff 49%, #eae6ff 100%);
  min-height: 100vh;
  /* 为底部固定 tabbar 预留空间，避免遮挡 exchange_box */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

:deep(.wd-grid-item__content) {
  border-radius: 8px;
}

.title_box {
  width: 300rpx;
  height: 88rpx;
  margin: 40rpx auto 0;

  .title {
    width: 100%;
    height: 100%;
    font-size: 50rpx;
    font-weight: bold;
    line-height: 88rpx;
    color: #5243aa;
    text-align: center;
  }
}

.module_box {
  padding: 30rpx;
}

:deep(.wd-grid) {
  border-radius: 20rpx;
}

.exchange_box {
  margin-top: 30rpx;

  .exchange_title_box {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .ck-icon {
      display: inline-block;
    }

    .exchange_title {
      font-size: 32rpx;
      font-weight: bold;
    }
  }
}

.exchange_footer {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
