<template>
  <view class="mcm-search-page">
    <!-- 顶部标签页 -->
    <view class="header-section">
      <wd-tabs v-model="currentTab" sticky @change="handleTabChange">
        <wd-tab title="客户" :name="0" />
        <wd-tab title="联系人" :name="1" />
        <!--        <wd-tab title="订单" :name="2"></wd-tab> -->
      </wd-tabs>

      <!-- 搜索栏 -->
      <view class="search-container">
        <wd-search
          v-model="searchValue"
          placeholder="搜索客户名称、联系人等"
          cancel-txt="搜索"
          hide-cancel
          @search="handleSearch"
          @clear="handleSearch"
        />
      </view>
    </view>

    <!-- 搜索结果区域 -->
    <view class="result-container">
      <!-- 结果统计 -->
      <view class="result-count">
        共找到 {{ resultList.length }} 条结果
      </view>

      <!-- 结果列表 -->
      <view class="card-list">
        <!-- 客户列表 (Tab 0) -->
        <block v-if="currentTab === 0">
          <view
            v-for="(item) in resultList as CustomerResult[]"
            :key="item.id"
            class="result-card customer-card"
            @click="handleCustomerClick(item)"
          >
            <!-- 公司名称行 -->
            <view class="card-header">
              <CKIcon
                custom-class="customer-icon"
                :name="item.customerType === 1 ? 'customer_icon_company' : 'icon_person'"
                size="40rpx"
              />
              <text class="company-name">{{ item.customerName }}</text>
              <view v-if="item.keyCustomerStar" class="vip-tag">
                重点
              </view>
            </view>

            <!-- 地址信息 -->
            <view class="info-row">
              <view class="info-item">
                <wd-icon name="location" size="14px" :color="themeColor" />
                <text class="info-text">{{ item.customerCity || '暂无地址' }}</text>
              </view>
              <view class="info-item product-item">
                <wd-icon name="goods" size="14px" :color="themeColor" />
                <text class="info-text">{{ item.goodsNames || '暂无产品' }}</text>
              </view>
            </view>

            <!-- 最近联系记录 -->
            <view class="history-row">
              <wd-icon name="history" size="14px" :color="themeColor" />
              <text class="history-text">
                {{ item.createTime }} {{ item.createBy }}: {{ item.trackContent }}
              </text>
            </view>
          </view>
        </block>

        <!-- 联系人列表 (Tab 1) -->
        <block v-if="currentTab === 1">
          <view
            v-for="(item) in resultList as ContactItem[]"
            :key="item.id"
            class="result-card contact-card"
          >
            <view class="contact-header">
              <view class="name-title-wrap">
                <text class="contact-name">{{ item.contactName }}</text>
                <text v-if="item.post" class="contact-title">({{ item.post }})</text>
              </view>
              <text class="contact-phone">{{ item.contactPhone }}</text>
            </view>

            <view class="company-row">
              <text class="contact-company">{{ item.customerName }}</text>
              <CKIcon
                line-height="40rpx"
                name="phone"
                size="40px"
                @click.stop.prevent="handlePhone(item)"
              />
            </view>

            <view class="remark-row">
              <text class="remark-text">备注:{{ item.remark || '-' }}</text>
            </view>
          </view>
        </block>

        <!-- 订单列表 (Tab 2) - 暂无 -->
        <block v-if="currentTab === 2">
          <view class="empty-state">
            暂无订单
          </view>
        </block>
      </view>
    </view>

    <!-- 电话拨打和跟进组件 - 懒加载 -->
    <PhoneCallFollowUp v-if="shouldLoadPhoneComponent" ref="phoneCallFollowUpRef" />
  </view>
</template>

<script setup lang="ts">
import type { ContactItem } from '@/pages-mcm/common/type'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import CKIcon from '@/pages-mcm/components/CKIcon/CKIcon.vue'
import PhoneCallFollowUp from '@/pages-mcm/components/PhoneCallFollowUp/PhoneCallFollowUp.vue'
import { mcmCustomerContactList, mcmCustomerPageList } from '@/pages-mcm/service/customer'

// --- 类型定义 ---
interface CustomerResult {
  id: number
  type: 'customer'
  customerType: number
  customerName: string
  keyCustomerStar: boolean
  customerCity: string
  goodsNames: string
  lastContactTime: string
  latestTrack: LatestTrack
  createBy: string
  createTime: string
  trackContent: string
}

interface LatestTrack {
  createBy: string
  createTime: string
  trackContent: string
}

type SearchResult = CustomerResult | ContactItem

// --- 状态定义 ---

// 当前选中的标签页索引
const currentTab = ref<number>(0)

// 搜索框的值
const searchValue = ref<string>('')

// 搜索结果列表
const resultList = ref<SearchResult[]>([])

// 分页相关
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false)

// 主题色
const themeColor = '#2979ff'

// 电话拨打组件引用和懒加载控制
const phoneCallFollowUpRef = ref()
const shouldLoadPhoneComponent = ref(false)

// --- 生命周期 ---
onLoad((options: any) => {
  if (options && options.searchValue) {
    searchValue.value = options.searchValue
  }
  fetchData()
})

onReachBottom(() => {
  if (resultList.value.length < total.value && !isLoading.value) {
    pageNum.value++
    fetchData()
  }
})

// --- 方法 ---

// Tab 切换处理
function handleTabChange({ index }: { index: number }) {
  currentTab.value = index
  resultList.value = []
  pageNum.value = 1
  total.value = 0
  fetchData()
}

// 搜索处理
function handleSearch() {
  pageNum.value = 1
  resultList.value = [] // 搜索时先清空列表，避免显示旧数据
  fetchData()
}

// 拨打电话
function handlePhone(item: any) {
  // 首次调用时加载组件
  if (!shouldLoadPhoneComponent.value) {
    shouldLoadPhoneComponent.value = true
    // 等待组件渲染完成后再调用方法，使用 setTimeout 确保组件完全加载
    nextTick(() => {
      setTimeout(() => {
        if (phoneCallFollowUpRef.value) {
          phoneCallFollowUpRef.value.makeCall({
            contactPhone: item.contactPhone,
            id: item.customerId,
          })
        }
      }, 50) // 给组件一点额外的时间完成初始化
    })
  }
  else {
    phoneCallFollowUpRef.value?.makeCall({
      contactPhone: item.contactPhone,
      id: item.customerId,
    })
  }
}

// API 数据获取
// 格式化日期 MM.DD
function formatDate(dateStr: string | undefined): string {
  if (!dateStr)
    return '-'
  // 尝试匹配 YYYY-MM-DD
  const match = dateStr.match(/^\d{4}-(\d{2})-(\d{2})/)
  if (match) {
    return `${Number.parseInt(match[1])}.${Number.parseInt(match[2])}`
  }
  return dateStr
}

// 客户数据映射
function mapCustomerResult(item: any): CustomerResult {
  return {
    id: item.id,
    type: 'customer',
    customerName: item.customerName || '',
    keyCustomerStar: !!item.keyCustomerStar,
    customerType: item.customerType,
    customerCity: item.customerCity || '-',
    goodsNames: item.goodsNames || '-',
    latestTrack: item.latestTrack || {},
    createBy: item.latestTrack?.createBy || '-',
    createTime: formatDate(item.latestTrack?.createTime),
    trackContent: item.latestTrack?.trackContent || '-',
    // 补充接口定义缺少的字段以满足类型检查 (如果 CustomerResult 接口更新了可以去掉)
    lastContactTime: item.latestTrack?.createTime || '-', // 这里根据接口定义补充
  }
}

// 联系人数据映射
function mapContactResult(item: any): ContactItem {
  return {
    ...item,
    type: 'contact',
    customerName: item.customerName || '',
  }
}

// 通用列表获取方法
async function fetchListHelper<T>(apiMethod: (params: any) => Promise<any>, mapper: (item: any) => T, errorMsg: string) {
  isLoading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      pmQueryCriteria: searchValue.value,
    }
    const res = await apiMethod(params)
    const data = res.data || {}
    const list = data.list || []
    const totalCount = data.total || 0

    const mappedList = list.map(mapper)

    if (pageNum.value === 1) {
      resultList.value = mappedList
    }
    else {
      resultList.value = [...resultList.value, ...mappedList]
    }
    total.value = totalCount
  }
  catch (error) {
    console.error(errorMsg, error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    })
  }
  finally {
    isLoading.value = false
  }
}

// API 数据获取
async function fetchData() {
  if (isLoading.value)
    return

  if (currentTab.value === 0) {
    // 客户列表
    await fetchListHelper<CustomerResult>(
      mcmCustomerPageList,
      mapCustomerResult,
      '获取客户列表失败:',
    )
  }
  else if (currentTab.value === 1) {
    // 联系人列表
    await fetchListHelper<ContactItem>(
      mcmCustomerContactList,
      mapContactResult,
      '获取联系人列表失败:',
    )
  }
  else {
    // 其他 Tab 暂无接口
    resultList.value = []
    total.value = 0
  }
}

function handleCustomerClick(item: CustomerResult) {
  uni.navigateTo({
    url: `/pages-mcm/customer/customerDetails?id=${item.id}`,
  })
}
</script>

<style lang="scss" scoped>
.mcm-search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-section {
  background-color: #fff;
  padding-bottom: 10px;
}

.search-container {
  padding: 10px 16px 0;
}

.result-container {
  flex: 1;
  padding: 0 16px;
}

.result-count {
  padding: 12px 0;
  font-size: 14px;
  color: #999;
}

.result-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

// 客户卡片样式
.customer-card {
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .company-icon {
      margin-right: 8px;
    }

    .company-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-right: 8px;
    }

    .vip-tag {
      background-color: #fff8e1;
      color: #ff9800;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .info-item {
      display: flex;
      align-items: center;
      margin-right: 20px;

      :deep(.wd-icon) {
        margin-right: 4px;
      }

      .info-text {
        font-size: 14px;
        color: #666;
      }

      &.product-item {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .history-row {
    display: flex;
    align-items: flex-start;

    :deep(.wd-icon) {
      margin-right: 4px;
      margin-top: 2px;
    }

    .history-text {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
      flex: 1;
      word-break: break-all;
    }
  }
}

// 联系人卡片样式
.contact-card {
  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .name-title-wrap {
      display: flex;
      align-items: baseline;

      .contact-name {
        font-size: 16px;
        font-weight: bold;
        color: #000;
        margin-right: 4px;
      }

      .contact-title {
        font-size: 14px;
        font-weight: bold; // 截图中的title看起来也是加粗的
        color: #000;
      }
    }

    .contact-phone {
      font-size: 14px;
      color: #333;
    }
  }

  .company-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .contact-company {
      font-size: 14px;
      color: #333;
    }

    .phone-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      // 右对齐，可能需要调整布局
    }
  }

  .remark-row {
    .remark-text {
      font-size: 14px;
      color: #333;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

:deep(.customer-icon) {
  margin-right: 4px;
  margin-bottom: 6px;
}
</style>
