<!--
  * @description mcm - 客户管理分页
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="customer_max_box">
    <!--  标题  -->
    <wd-navbar
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      custom-style="background-color: #eae6ff !important;"
      title="客户管理"
      @click-left="handleGeneralBack"
    />

    <!--  内容框  -->
    <view class="order_content_box">
      <!--  搜索框  -->
      <wd-search
        v-model="form.pmQueryCriteria"
        custom-class="search_custom_class"
        hide-cancel
        light
        placeholder="搜索客户名称、联系人、电话"
        placeholder-left
        @search="handelSearch"
      />

      <!--  筛选框  -->
      <view @click="closeOutside">
        <wd-drop-menu ref="dropMenuRef">
          <wd-drop-menu-item
            v-model="form.customerType"
            :options="customerTypeList"
            :title="customerTypeTitle"
            @change="handelSearch"
          />
          <wd-drop-menu-item
            v-model="form.cooperateState"
            :options="cooperateStateList"
            :title="cooperateStateTitle"
            @change="handelSearch"
          />
          <wd-drop-menu-item
            v-model="citySearchValue"
            :before-toggle="handleCitySearchClick"
            :options="citySearchOptions"
            :title="citySearchTitle"
            custom-class="city-search-menu-item"
          />
          <wd-drop-menu-item
            v-model="goodsSearchValue"
            :before-toggle="handleGoodsSearchClick"
            :options="goodsSearchOptions"
            :title="mainGoodsNameTitle"
            custom-class="goods-search-menu-item"
          />
        </wd-drop-menu>
      </view>

      <!--  数据卡片  -->
      <view class="card_box">
        <view
          v-for="(item, index) in list"
          :key="index"
          class="card_item"
          @click="handleDetail(item)"
        >
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

            <view style="min-width: 100rpx">
              <wd-tag :type="getPastDaysType(item.pastDays)" mark round>
                {{ item.pastDays }}天前跟进
              </wd-tag>
            </view>
          </view>

          <view class="card_item_content">
            <view style="flex: 1">
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
                  <text class="goods_names_text">{{ formatGoodsNames(item.goodsNames) }}</text>
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

            <CKIcon
              line-height="40rpx"
              name="phone"
              size="40px"
              @click.stop.prevent="handlePhone(item)"
            />
          </view>
        </view>

        <!--  加载页面  -->
        <wd-loadmore v-if="list.length !== 0" :state="state" finished-text="无更多数据" />
        <!--  空白页面  -->
        <ck-status-tip v-if="list.length === 0" image="search" tip="当前搜索无结果" />
      </view>
    </view>
  </view>

  <!--  城市搜索弹窗  -->
  <CitySearchPopup
    v-model="citySearchVisible"
    :value="form.customerCity"
    @reset="handleCitySearchReset"
    @submit="handleCitySearchSubmit"
  />

  <!--  品类搜索弹窗  -->
  <GoodsSearchPopup
    v-model="goodsSearchVisible"
    :value="form.goodsTag"
    @reset="handleGoodsSearchReset"
    @submit="handleGoodsSearchSubmit"
  />

  <!--  联系人选择弹窗（拨打电话前选择联系人）  -->
  <ContactSelector
    v-model="contactSelectorVisible"
    :contact-list="contactListForSelector"
    :customer-id="selectedCustomerId"
  />

  <!--  悬浮按钮  -->
  <view class="fab-container">
    <wd-fab :expandable="false" :draggable="true" icon="add" @click="handleAddCustomer" />
  </view>
</template>

<script lang="ts" setup>
import type { DropMenuItemBeforeToggle } from 'wot-design-uni/components/wd-drop-menu-item/types'
import dayjs from 'dayjs'
import { useQueue } from 'wot-design-uni'
import { httpGet } from '@/http/http'
import CKIcon from '@/pages-mcm/components/CKIcon/CKIcon.vue'
import { apiGetDictByType } from '@/service/common'
import { handleGeneralBack } from '@/utils/function'
import { mcmCustomerContactByCustomerId, mcmCustomerPageList } from '../service/customer/index'
import CitySearchPopup from './components/CitySearchPopup.vue'
import ContactSelector from './components/CustomerActionBar/components/ContactSelector.vue'
import GoodsSearchPopup from './components/GoodsSearchPopup.vue'

const { closeOutside } = useQueue()

const state = ref<string>('loading')
const tabsList: Ref<any[]> = ref([])
const serviceCodeList: Ref<any[]> = ref([])
const list = ref<any[]>([])
const total = ref<number>(0)
const form = ref<any>({
  pageNum: 1,
  pageSize: 10,
  pmQueryCriteria: '',
  // 客户类型
  customerType: 0,
  // 合作状态
  cooperateState: 0,
  // 主营品名（字符串格式）
  goodsTag: '',
  // 城市搜索
  customerCity: '',
})

// 获取分页数据
async function fetchData() {
  console.log('我刷新了', 'fetchData')

  const { data } = await mcmCustomerPageList({
    ...form.value,
    goodsTag: form.value.goodsTag || '',
    taskStatus: form.value.taskStatus === 0 ? null : form.value.taskStatus,
  } as any)
  list.value = [...list.value, ...data.list]
  total.value = data.total
  state.value = list.value.length >= total.value ? 'finished' : 'loading'
}

// 获取字典列表 order_status
async function getDictList() {
  const { data } = await apiGetDictByType('cooperate_state')
  tabsList.value = data
}

// 获取字典列表 ck_service_code
async function getDictListServiceCode() {
  const { data } = await apiGetDictByType('ck_service_code')
  serviceCodeList.value = data
}

// 客户类型列表 customer_type
const customerTypeList = ref([])
async function getCustomerTypeList() {
  const { data } = await apiGetDictByType('customer_type')
  customerTypeList.value = [{ dictLabel: '不限', dictValue: 0 }, ...(data as any[])].map(
    (item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }),
  )
}

// 客户合作状态  cooperate_state
const cooperateStateList = ref([])
async function getCooperateStateList() {
  const { data } = await apiGetDictByType('cooperate_state')
  cooperateStateList.value = [{ dictLabel: '不限', dictValue: 0 }, ...(data as any[])].map(
    (item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }),
  )
}
getCooperateStateList()

// 主营品名
const mainGoodsNameList = ref([])
function getMainGoodsNameList() {
  useRequest<any>(async () => {
    const { data } = await httpGet<IResData<any>>('/bdm/goods/list')
    mainGoodsNameList.value = [{ nameCn: '不限', id: '' }, ...(data as any[])].map((item: any) => {
      return {
        label: item.nameCn,
        value: item.id,
      }
    })
  })
}

getMainGoodsNameList()

// 城市搜索相关
const citySearchVisible = ref(false)
const citySearchValue = ref('')

// 城市搜索选项（使用一个隐藏选项用于触发事件，但通过 CSS 隐藏下拉面板）
const citySearchOptions = ref([{ label: '不限', value: '' }])

// 品类搜索相关
const goodsSearchVisible = ref(false)
const goodsSearchValue = ref('')

// 品类搜索选项（使用一个隐藏选项用于触发事件，但通过 CSS 隐藏下拉面板）
const goodsSearchOptions = ref([{ label: '不限', value: '' }])

// 城市搜索标题
const citySearchTitle = computed(() => {
  if (!form.value.customerCity || form.value.customerCity === '') {
    return '所在城市'
  }
  return form.value.customerCity
})

const dropMenuRef = ref()

const handleCitySearchClick: DropMenuItemBeforeToggle = ({ resolve }) => {
  // 直接打开搜索弹窗
  citySearchVisible.value = true
  resolve(false)
}

// 重置城市搜索
function handleCitySearchReset() {
  form.value.customerCity = ''
  handelSearch()
}

// 提交城市搜索
function handleCitySearchSubmit(keyword: string) {
  form.value.customerCity = keyword
  handelSearch()
}

// 品类搜索点击处理
const handleGoodsSearchClick: DropMenuItemBeforeToggle = ({ resolve }) => {
  // 直接打开搜索弹窗
  goodsSearchVisible.value = true
  resolve(false)
}

// 重置品类搜索
function handleGoodsSearchReset() {
  form.value.goodsTag = ''
  handelSearch()
}

// 提交品类搜索
function handleGoodsSearchSubmit(keyword: string) {
  form.value.goodsTag = keyword
  handelSearch()
}

// 计算属性：动态设置下拉菜单标题
const customerTypeTitle = computed(() => {
  if (form.value.customerType === 0) {
    return '客户类型'
  }
  const selectedOption = customerTypeList.value.find(
    (item: any) => item.value === form.value.customerType,
  )
  return selectedOption?.label || '客户类型'
})

const cooperateStateTitle = computed(() => {
  if (form.value.cooperateState === 0) {
    return '合作状态'
  }
  const selectedOption = cooperateStateList.value.find(
    (item: any) => item.value === form.value.cooperateState,
  )
  return selectedOption?.label || '合作状态'
})

const mainGoodsNameTitle = computed(() => {
  if (!form.value.goodsTag || form.value.goodsTag === '') {
    return '主营品名'
  }
  return form.value.goodsTag
})

function handelSearch() {
  init()
  fetchData()
}

// 主营品名超过8个字省略
function formatGoodsNames(goodsNames: string | undefined) {
  const text = goodsNames || '无主营品名'
  return text.length > 8 ? `${text.slice(0, 8)}...` : text
}

// 跟进时间颜色：0-3天绿色，4-14天黄色，大于15天红色
function getPastDaysType(pastDays: number | string) {
  const days = Number(pastDays) || 0
  if (days <= 3)
    return 'success'
  if (days <= 14)
    return 'warning'
  return 'danger'
}

// 初始化参数
function init() {
  form.value.pageNum = 1
  list.value = []
  state.value = 'loading'
}

// 联系人选择弹窗（拨打电话前）
const contactSelectorVisible = ref(false)
const contactListForSelector = ref<any[]>([])
const selectedCustomerId = ref<string | number | undefined>(undefined)

// 跳转详情
function handleDetail(item: any) {
  console.log(item)
  uni.navigateTo({
    url: `/pages-mcm/customer/customerDetails?id=${item.id}`,
  })
}

// 拨打电话：先通过接口获取联系人，再打开联系人选择弹窗
async function handlePhone(item: any) {
  const customerId = item?.id
  if (!customerId) {
    uni.showToast({ title: '无可用电话', icon: 'none' })
    return
  }
  try {
    const { data } = await mcmCustomerContactByCustomerId(customerId)
    const list = Array.isArray(data) ? data : (data?.list ?? data?.data ?? [])
    const hasPhone = list.length > 0 && list.some((c: any) => (c?.contactPhone || '').toString().trim())
    if (!hasPhone) {
      uni.showToast({ title: '无可用电话', icon: 'none' })
      return
    }
    selectedCustomerId.value = customerId
    contactListForSelector.value = list
    contactSelectorVisible.value = true
  }
  catch {
    uni.showToast({ title: '无可用电话', icon: 'none' })
  }
}

// 跳转新增客户页面
function handleAddCustomer() {
  uni.navigateTo({
    url: '/pages-mcm/customer/customerAddOrUpdate',
  })
}

// 回显最新一条跟进记录
function getLastFollowRecord(followUpRecordInfo: any) {
  if (!followUpRecordInfo?.trackContent) {
    return '无跟进信息'
  }
  return `${dayjs(followUpRecordInfo.createTime).format('MM.DD')} ${followUpRecordInfo.createBy}: ${followUpRecordInfo.trackContent}`
}

getDictList()
getDictListServiceCode()
getCustomerTypeList()
fetchData()

// 页面显示时刷新数据（从编辑页面返回时）
onShow(() => {
  // 如果列表已有数据，说明是从其他页面返回，需要刷新
  if (list.value.length > 0) {
    init()
    fetchData()
  }
})

// 做一个到底分页
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

:deep(.wd-tabs__line) {
  background: #5243aa;
}

:deep(.col_class) {
  display: flex;
  align-items: center;
}

:deep(.value_icon) {
  margin-right: 14rpx;
}

.fab-container {
  position: fixed;
  right: 150rpx;
  bottom: 400rpx;
  z-index: 999;
}

.customer_max_box {
  padding: 0 20rpx;

  .order_content_box {
    background: #fff;
    // padding: 20rpx 40rpx;
    padding: 20rpx;
    border-radius: 10rpx;

    .card_box {
      margin-top: 20rpx;

      .card_item {
        padding: 36rpx 32rpx;
        margin-bottom: 50rpx;
        border: 4rpx solid #5243aa;
        border-radius: 12rpx;

        .title_box {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .title_box_left {
            display: flex;
            align-items: center;
            flex: 1;
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
        }

        .card_item_content {
          margin-top: 20rpx;
          font-size: 26rpx;
          display: flex;
          justify-content: space-between;

          .goods_names_text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .follow_record_text {
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 470rpx;
            white-space: nowrap;
          }

          .server_box {
            margin-top: 20rpx;
          }
        }
      }
    }
  }
}
</style>
