<!--
  * @description mcm - 客户跟进记录列表
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="follow-up-page">
    <!--  标题  -->
    <wd-navbar
      :fixed="true" :left-arrow="true" :placeholder="true" :safe-area-inset-top="true" title="跟进记录"
      custom-style="background-color: #fff !important;" @click-left="handleGeneralBack"
    />

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <!-- 时间轴列表 -->
      <view class="timeline-container" :class="{ 'has-data': groupedList.length > 0 }">
        <template v-for="group in groupedList" :key="group.date">
          <!-- 日期标题 -->
          <view class="date-group">
            <view class="date-title">
              {{ formatDateTitle(group.date) }}
            </view>
          </view>

          <!-- 该日期下的跟进记录 -->
          <view v-for="(item, index) in group.items" :key="item.id" class="timeline-item">
            <!-- 时间轴圆点 -->
            <view class="timeline-dot" :class="{ 'is-first': index === 0 }" />

            <!-- 跟进记录卡片 -->
            <view class="follow-up-card">
              <!-- 跟进内容 -->
              <view class="card-row content-row" @click="handleViewDetail(item)">
                <text class="label">跟进内容：</text>
                <text class="value">{{ item.trackContent || '-' }}</text>
              </view>

              <!-- 下一步任务 -->
              <view v-if="item.nextStep" class="card-row task-row" @click="handleViewDetail(item)">
                <text class="label">下一步任务：</text>
                <text class="value">{{ item.nextStep }}</text>
              </view>

              <!-- 元数据行：提交人、提交时间、回访方式 -->
              <view class="card-row meta-row">
                <text class="meta-text">
                  {{ item.trackUserName || '-' }} 提交于
                  {{ formatDateTime(item.createTime) }}
                  <text v-if="item.followUpMethod" class="method-text">
                    回访方式: {{ getFollowUpMethodName(item.followUpMethod) }}
                  </text>
                </text>
              </view>

              <!-- 评论区域 -->
              <view v-if="item.commentList && item.commentList.length > 0" class="comment-section">
                <view v-for="comment in item.commentList" :key="comment.id" class="comment-item">
                  <!-- 一级评论 -->
                  <view class="comment-content">
                    <text class="comment-author">{{ comment.createBy }}</text>
                    <text v-if="comment.toUser" class="comment-text">
                      :@{{ comment.toUser }}
                    </text>
                    <text class="comment-text">: {{ comment.commentContent }}</text>
                  </view>
                  <view class="comment-footer">
                    <text class="comment-time">{{ formatDateTime(comment.createTime) }}</text>
                    <text class="comment-reply" @click="handleReply(comment, item)">回复</text>
                  </view>

                  <!-- 二级评论（嵌套回复） -->
                  <view v-if="comment.childList && comment.childList.length > 0" class="comment-child-list">
                    <view v-for="child in comment.childList" :key="child.id" class="comment-item child-comment">
                      <view class="comment-content">
                        <text class="comment-author">{{ child.createBy }}</text>
                        <text v-if="child.toUser" class="comment-text">
                          :@{{ child.toUser }}
                        </text>
                        <text class="comment-text">: {{ child.commentContent }}</text>
                      </view>
                      <view class="comment-footer">
                        <text class="comment-time">{{ formatDateTime(child.createTime) }}</text>
                        <text class="comment-reply" @click="handleReply(child, item)">回复</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </template>

        <!-- 空状态 -->
        <view v-if="groupedList.length === 0 && !isLoading" class="empty-state">
          <ck-status-tip image="content" tip="暂无跟进记录" />
        </view>

        <!-- 加载中 -->
        <view v-if="isLoading && groupedList.length === 0" class="loading-state">
          加载中...
        </view>

        <!-- 加载更多提示 -->
        <view v-if="isLoading && groupedList.length > 0" class="loading-more">
          加载中...
        </view>
      </view>
    </view>

    <!-- 底部新增跟进按钮 -->
    <view class="add-button-container">
      <button class="add-button" @click="handleAddFollowUp">
        新增跟进
      </button>
    </view>

    <!-- 跟进详情弹窗 -->
    <FollowUpDetail
      v-model="showDetailPopup" :detail-data="currentDetailItem"
      :follow-up-method-list="followUpMethodList" @reply="handleDetailReply" @close="closeDetailPopup"
    />

    <!-- 回复评论弹窗 -->
    <FollowUpReply
      v-model="showReplyPopup" :placeholder="replyPlaceholder" @submit="handleReplySubmit"
      @close="closeReplyPopup"
    />

    <!-- 新增评论弹窗 -->
    <FollowUpComment v-model="showCommentPopup" @submit="handleCommentSubmit" @close="closeCommentPopup" />

    <!-- 新增跟进弹窗 -->
    <FollowUpAdd
      v-model="showAddFollowUpPopup" :customer-id="routeOptions.customerId" @saved="handleFollowUpSaved"
      @close="closeAddFollowUpPopup"
    />
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import FollowUpAdd from '@/pages-mcm/customer/components/CustomerLatestFollowUp/components/FollowUpAdd.vue'
import FollowUpComment from '@/pages-mcm/customer/components/CustomerLatestFollowUp/components/FollowUpComment.vue'
import FollowUpDetail from '@/pages-mcm/customer/components/CustomerLatestFollowUp/components/FollowUpDetail.vue'
import FollowUpReply from '@/pages-mcm/customer/components/CustomerLatestFollowUp/components/FollowUpReply.vue'
import { mcmCustomerTrackComment, mcmCustomerTrackList } from '@/pages-mcm/service/customer'
import { apiGetDictByType } from '@/service/common'
import { handleGeneralBack } from '@/utils/function'

// 路由参数
const routeOptions = ref<{ customerId?: string }>({})

// 跟进记录列表
const followUpList = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(6)
const total = ref(0)
const isLoading = ref(false)

// 跟进方式字典
const followUpMethodList = ref<any[]>([])

// 详情弹窗相关
const showDetailPopup = ref(false)
const currentDetailItem = ref<any>(null)

// 回复弹窗相关
const showReplyPopup = ref(false)
const currentTrackItem = ref<any>(null)
const currentComment = ref<any>(null)
const replyPlaceholder = computed(() => {
  if (currentComment.value) {
    return `回复 ${currentComment.value.createBy}:`
  }
  return '请输入回复内容'
})

// 评论弹窗相关
const showCommentPopup = ref(false)
const commentTrackItem = ref<any>(null)

// 新增跟进弹窗相关
const showAddFollowUpPopup = ref(false)

// 按日期分组的列表
const groupedList = computed(() => {
  const groups: { [key: string]: any[] } = {}

  followUpList.value.forEach((item) => {
    const date = item.followUpDate
      ? dayjs(item.followUpDate).format('YYYY-MM-DD')
      : dayjs(item.createTime).format('YYYY-MM-DD')

    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })

  // 转换为数组并按日期倒序排列
  return Object.keys(groups)
    .sort((a, b) => (dayjs(b).isAfter(dayjs(a)) ? 1 : -1))
    .map(date => ({
      date,
      items: groups[date],
    }))
})

// 格式化日期标题
function formatDateTitle(dateStr: string) {
  const d = dayjs(dateStr)
  if (!d.isValid())
    return dateStr
  return d.format('YYYY-MM-DD')
}

// 格式化日期时间
function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr)
    return '-'
  const d = dayjs(dateStr)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : String(dateStr)
}

// 获取跟进方式名称
function getFollowUpMethodName(methodValue: string | number) {
  if (!methodValue)
    return ''
  const method = followUpMethodList.value.find(
    item => String(item.value) === String(methodValue),
  )
  return method ? method.label : String(methodValue)
}

// 获取跟进方式字典
async function getFollowUpMethodList() {
  try {
    const { data } = await apiGetDictByType('follow_up_method')
    followUpMethodList.value = (data as any[]).map((item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }))
  }
  catch (e) {
    console.error('获取跟进方式失败', e)
  }
}

// 获取跟进记录列表
async function fetchData() {
  if (isLoading.value)
    return
  if (!routeOptions.value.customerId) {
    uni.showToast({ title: '缺少客户ID', icon: 'none' })
    return
  }

  isLoading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      customerId: routeOptions.value.customerId,
    }
    const res = (await mcmCustomerTrackList(params)) as any
    const list = res.data?.list || []
    const totalCount = res.data?.total || 0

    if (pageNum.value === 1) {
      followUpList.value = list
    }
    else {
      followUpList.value = [...followUpList.value, ...list]
    }
    total.value = totalCount
  }
  catch (e) {
    console.error('获取跟进记录失败', e)
    uni.showToast({ title: '获取跟进记录失败', icon: 'none' })
  }
  finally {
    isLoading.value = false
  }
}

// 查看跟进详情
function handleViewDetail(item: any) {
  currentDetailItem.value = item
  showDetailPopup.value = true
}

// 关闭详情弹窗
function closeDetailPopup() {
  showDetailPopup.value = false
  currentDetailItem.value = null
}

// 详情弹窗中的回复评论按钮
function handleDetailReply() {
  // 关闭详情弹窗，打开评论弹窗
  if (currentDetailItem.value) {
    commentTrackItem.value = currentDetailItem.value
    closeDetailPopup()
    showCommentPopup.value = true
  }
}

// 打开回复弹窗
function handleReply(comment: any, trackItem: any) {
  currentComment.value = comment
  currentTrackItem.value = trackItem
  showReplyPopup.value = true
}

// 关闭回复弹窗
function closeReplyPopup() {
  showReplyPopup.value = false
  currentComment.value = null
  currentTrackItem.value = null
}

// 关闭评论弹窗
function closeCommentPopup() {
  showCommentPopup.value = false
  commentTrackItem.value = null
}

// 提交评论
async function handleCommentSubmit(content: string) {
  if (!commentTrackItem.value) {
    uni.showToast({ title: '缺少跟进记录信息', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '提交中...' })
    await mcmCustomerTrackComment({
      customerTrackId: commentTrackItem.value.id,
      commentContent: content,
    })
    uni.hideLoading()
    uni.showToast({ title: '评论成功', icon: 'success' })

    // 关闭弹窗
    closeCommentPopup()

    // 刷新列表
    pageNum.value = 1
    followUpList.value = []
    fetchData()
  }
  catch (e) {
    uni.hideLoading()
    console.error('评论失败', e)
    uni.showToast({ title: '评论失败', icon: 'none' })
  }
}

// 提交回复
async function handleReplySubmit(content: string) {
  if (!currentTrackItem.value) {
    uni.showToast({ title: '缺少跟进记录信息', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '提交中...' })
    await mcmCustomerTrackComment({
      customerTrackId: currentTrackItem.value.id,
      commentContent: content,
      pid: currentComment.value?.id || null,
    })
    uni.hideLoading()
    uni.showToast({ title: '回复成功', icon: 'success' })

    // 关闭弹窗
    closeReplyPopup()

    // 刷新列表
    pageNum.value = 1
    followUpList.value = []
    fetchData()
  }
  catch (e) {
    uni.hideLoading()
    console.error('回复失败', e)
    uni.showToast({ title: '回复失败', icon: 'none' })
  }
}

// 新增跟进
function handleAddFollowUp() {
  if (!routeOptions.value.customerId) {
    uni.showToast({ title: '缺少客户ID', icon: 'none' })
    return
  }
  showAddFollowUpPopup.value = true
}

// 关闭新增跟进弹窗
function closeAddFollowUpPopup() {
  showAddFollowUpPopup.value = false
}

// 新增跟进保存成功
function handleFollowUpSaved() {
  // 刷新列表
  pageNum.value = 1
  followUpList.value = []
  fetchData()
}

// 页面加载时获取路由参数
onLoad((options) => {
  routeOptions.value = options || {}
  getFollowUpMethodList()
  if (routeOptions.value.customerId) {
    fetchData()
  }
})

// 页面显示时刷新数据（从新增页面返回时）
onShow(() => {
  if (routeOptions.value.customerId && followUpList.value.length > 0) {
    pageNum.value = 1
    followUpList.value = []
    fetchData()
  }
})

// 触底加载更多
onReachBottom(() => {
  if (followUpList.value.length < total.value && !isLoading.value) {
    pageNum.value++
    fetchData()
  }
})
</script>

<style lang="scss" scoped>
.follow-up-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx; // 为底部按钮留出空间
}

.content-wrapper {
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.timeline-container {
  position: relative;
  padding-left: 60rpx; // 为时间轴留出空间

  // 时间轴竖线 - 只在有数据时显示
  &.has-data::before {
    content: '';
    position: absolute;
    left: 20rpx;
    top: 0;
    bottom: 0;
    width: 2rpx;
    background-color: #e5e5e5;
  }

  // 没有数据时，移除左侧padding，让缺省图居中
  &:not(.has-data) {
    padding-left: 0;
  }

  .date-group {
    position: relative;
    margin-bottom: 32rpx;

    .date-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-left: -60rpx;
      padding-left: 60rpx;
    }
  }

  .timeline-item {
    position: relative;
    margin-bottom: 32rpx;

    // 时间轴圆点
    .timeline-dot {
      position: absolute;
      left: -48rpx;
      top: 20rpx;
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background-color: #e5e5e5;
      border: 4rpx solid #fff;
      z-index: 1;

      &.is-first {
        background-color: #ff9800; // 第一个圆点用橙色
      }
    }

    .follow-up-card {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 32rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

      .card-row {
        margin-bottom: 24rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .content-row {
        display: flex;
        align-items: flex-start;
        cursor: pointer;

        .label {
          font-size: 28rpx;
          color: #666;
          white-space: nowrap;
          margin-right: 16rpx;
        }

        .value {
          flex: 1;
          font-size: 28rpx;
          color: #333;
          word-break: break-all;
          line-height: 1.6;
        }
      }

      .task-row {
        display: flex;
        align-items: flex-start;

        .label {
          font-size: 28rpx;
          color: #666;
          white-space: nowrap;
          margin-right: 16rpx;
        }

        .value {
          flex: 1;
          font-size: 28rpx;
          color: #333;
          word-break: break-all;
          line-height: 1.6;
        }
      }

      .meta-row {
        padding-top: 16rpx;
        border-top: 1px solid #f5f5f5;

        .meta-text {
          font-size: 24rpx;
          color: #999;
          line-height: 1.5;

          .method-text {
            margin-left: 16rpx;
          }
        }
      }

      // 评论区域
      .comment-section {
        margin-top: 24rpx;
        padding-top: 24rpx;
        border-top: 1px solid #f5f5f5;
        background-color: #fafafa;
        border-radius: 8rpx;
        padding: 24rpx;

        .comment-item {
          margin-bottom: 24rpx;

          &:last-child {
            margin-bottom: 0;
          }

          &.child-comment {
            margin-left: 40rpx;
            margin-top: 16rpx;
          }

          .comment-content {
            font-size: 26rpx;
            color: #333;
            line-height: 1.6;
            margin-bottom: 8rpx;

            .comment-author {
              font-weight: 500;
              color: #2979ff;
            }

            .comment-text {
              color: #666;
            }
          }

          .comment-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8rpx;

            .comment-time {
              font-size: 22rpx;
              color: #999;
            }

            .comment-reply {
              font-size: 22rpx;
              color: #2979ff;
            }
          }
        }

        .comment-child-list {
          margin-top: 16rpx;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 80rpx 0;
    color: #999;
    font-size: 28rpx;
  }

  .loading-state {
    text-align: center;
    padding: 80rpx 0;
    color: #999;
    font-size: 28rpx;
  }

  .loading-more {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 24rpx;
  }
}

// 底部新增按钮
.add-button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background-color: #fff;
  border-top: 1px solid #eee;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 10;

  .add-button {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background-color: #2979ff;
    color: #fff;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;

    &::after {
      border: none;
    }
  }
}
</style>
