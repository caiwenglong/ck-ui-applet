<!--
  * @description mcm - 客户管理 - 现有客户导入选择
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="customer-import-box">
    <wd-toast />
    <wd-navbar
      :bordered="false"
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      custom-style="background-color: #eae6ff !important;"
      title="选择客户"
      @click-left="handleGeneralBack"
    />

    <view class="order_content_box">
      <!-- 搜索框 -->
      <wd-search
        v-model="form.pmQueryCriteria"
        custom-class="search_custom_class"
        hide-cancel
        light
        placeholder="搜索客户/联系人名称"
        placeholder-left
        @search="handelSearch"
      />

      <!-- 数据卡片 -->
      <view class="card_box">
        <wd-radio-group v-model="selectedId">
          <view
            v-for="(item, index) in list"
            :key="item.id || index"
            class="card_item" :class="[{ 'is-selected': selectedId === item.id }]"
            @click="handleSelectItem(item)"
          >
            <view class="radio_wrapper">
              <wd-radio :value="item.id" />
            </view>

            <view class="card_main">
              <view class="title_box">
                <view class="title_box_left">
                  <CKIcon
                    v-if="item.customerType === 1"
                    line-height="19rpx"
                    name="customer_icon_company"
                    size="19px"
                  />
                  <CKIcon
                    v-if="item.customerType === 2"
                    line-height="19rpx"
                    name="customer_icon_person"
                    size="19px"
                  />
                  <text class="title">{{ item.customerName }}</text>
                  <CKIcon
                    v-if="item.keyCustomerStar"
                    line-height="14rpx"
                    name="vip2"
                    size="14px"
                  />
                </view>

                <view class="tag_wrapper">
                  <wd-tag :type="getPastDaysType(item.pastDays)" mark round>
                    {{ item.pastDays }}天前跟进
                  </wd-tag>
                </view>
              </view>

              <view class="card_item_content">
                <view class="content_flex">
                  <wd-row>
                    <wd-col :span="12" custom-class="col_class">
                      <CKIcon
                        custom-class="value_icon"
                        line-height="12rpx"
                        name="address_icon"
                        size="12px"
                      />
                      <text>{{ item.customerCity || '-' }}</text>
                    </wd-col>
                    <wd-col :span="12" custom-class="col_class">
                      <CKIcon
                        custom-class="value_icon"
                        line-height="12rpx"
                        name="goods_icon"
                        size="12px"
                      />
                      {{ item.goodsNames || '-' }}
                    </wd-col>
                    <wd-col :span="24" custom-class="col_class">
                      <CKIcon
                        custom-class="value_icon"
                        line-height="12rpx"
                        name="update_history_icon"
                        size="12px"
                      />
                      <text class="follow_record_text">
                        {{ getLastFollowRecord(item.latestTrack) }}
                      </text>
                    </wd-col>
                  </wd-row>
                </view>
              </view>
            </view>
          </view>
        </wd-radio-group>

        <wd-loadmore v-if="list.length !== 0" :state="state" />
        <ck-status-tip v-if="list.length === 0" image="search" tip="当前搜索无结果" />
      </view>
    </view>

    <!-- 底部确定按钮 -->
    <view class="footer">
      <wd-button block size="large" type="primary" @click="handleConfirm">
        确定
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { useMessage } from 'wot-design-uni'
import CKIcon from '@/pages-mcm/components/CKIcon/CKIcon.vue'
import { handleGeneralBack } from '@/utils/function'
import { mcmCustomerPageList } from '../service/customer/index'

const message = useMessage()

const state = ref<string>('loading')
const list = ref<any[]>([])
const total = ref<number>(0)
const selectedId = ref<string | number | null>(null)

const form = ref({
  pageNum: 1,
  pageSize: 10,
  pmQueryCriteria: '',
  customerType: 0,
  cooperateState: 0,
  goodsTag: '',
  customerCity: '',
})

// 获取分页数据
async function fetchData() {
  try {
    const { data } = await mcmCustomerPageList({
      ...form.value,
      goodsTag: form.value.goodsTag || '',
    } as any)
    list.value = [...list.value, ...(data.list || [])]
    total.value = data.total || 0
    state.value = list.value.length >= total.value ? 'finished' : 'loading'
  }
  catch (e) {
    console.error('获取客户列表失败', e)
    state.value = 'error'
  }
}

// 搜索
function handelSearch() {
  init()
  fetchData()
}

// 初始化参数
function init() {
  form.value.pageNum = 1
  list.value = []
  state.value = 'loading'
}

// 跟进时间颜色
function getPastDaysType(pastDays: number | string) {
  const days = Number(pastDays) || 0
  if (days <= 7)
    return 'success'
  if (days <= 14)
    return 'warning'
  return 'danger'
}

// 回显最新一条跟进记录
function getLastFollowRecord(followUpRecordInfo: any) {
  if (!followUpRecordInfo?.trackContent) {
    return '-'
  }
  return `${dayjs(followUpRecordInfo.createTime).format('MM.DD')} ${followUpRecordInfo.createBy}: ${followUpRecordInfo.trackContent}`
}

// 选择列表项（单选）
function handleSelectItem(item: any) {
  selectedId.value = item.id
}

// 确定
function handleConfirm() {
  if (!selectedId.value) {
    uni.showToast({ title: '请先选择客户', icon: 'none' })
    return
  }

  const selectedItem = list.value.find(item => item.id === selectedId.value)
  const customerName = selectedItem?.customerName || ''

  message
    .confirm({
      msg: `确认导入【${customerName}】信息，将覆盖已填写内容，请确认`,
      title: '确认导入',
    })
    .then(() => {
      uni.redirectTo({
        url: `/pages-mcm/customer/customerAddOrUpdate?importCustomerId=${selectedId.value}`,
      })
    })
    .catch(() => {})
}

onLoad(() => {
  fetchData()
})

onReachBottom(() => {
  if (list.value.length < total.value) {
    form.value.pageNum++
    fetchData()
  }
  else {
    state.value = 'finished'
  }
})
</script>

<style>
page {
  background: #eae6ff;
}
</style>

<style lang="scss" scoped>
:deep(.search_custom_class) {
  background: none !important;
}

:deep(.search_custom_class .wd-search__block) {
  border: 1px solid #f5f5f5;
}

:deep(.col_class) {
  display: flex;
  align-items: center;
}

.value_icon {
  margin: 0 10rpx;
}

.customer-import-box {
  min-height: 100vh;
  background: #eae6ff;
  padding: 0 20rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.order_content_box {
  background: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
}

.card_box {
  margin-top: 20rpx;
}

.card_item {
  display: flex;
  align-items: flex-start;
  padding: 36rpx 32rpx;
  margin-bottom: 50rpx;
  border: 4rpx solid #5243aa;
  border-radius: 12rpx;

  &.is-selected {
    border-color: #018d71;
  }
}

.radio_wrapper {
  flex-shrink: 0;
  margin-right: 20rpx;
  padding-top: 4rpx;
}

.card_main {
  flex: 1;
  min-width: 0;
}

.title_box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title_box_left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-left: 14rpx;
  margin-right: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 380rpx;
}

.tag_wrapper {
  flex-shrink: 0;
  min-width: 100rpx;
}

.card_item_content {
  margin-top: 20rpx;
  font-size: 26rpx;
  display: flex;
  justify-content: space-between;
}

.follow_record_text {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 470rpx;
  white-space: nowrap;
}

.content_flex {
  flex: 1;
}

.footer {
  position: fixed;
  bottom: 20rpx;
  left: 0;
  right: 0;
  padding: 20rpx;
  z-index: 2;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
