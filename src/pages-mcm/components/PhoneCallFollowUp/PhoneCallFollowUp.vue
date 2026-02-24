<template>
  <view>
    <!-- 拨打电话后的确认弹窗 -->
    <wd-popup v-model="showCallConfirm" custom-style="border-radius: 16px; width: 600rpx;">
      <view class="confirm-popup">
        <view class="icon-area">
          <view class="warn-icon">
            !
          </view>
        </view>
        <view class="confirm-title">
          {{ t('mcmAddFollowUp') }}
        </view>
        <view class="confirm-desc">
          {{ t('mcmAddFollowUpDesc') }}
        </view>
        <view class="confirm-btns">
          <button class="btn cancel" @click="closeCallConfirm">
            {{ t('mcmCancel') }}
          </button>
          <button class="btn primary" @click="toAddFollowUp">
            {{ t('mcmCreateFollowUp') }}
          </button>
        </view>
      </view>
    </wd-popup>

    <!-- 新建跟进弹窗 -->
    <wd-popup
      v-model="showAddFollowUp"
      position="bottom"
      custom-style="border-radius: 16px 16px 0 0; height: 85vh; display: flex; flex-direction: column;"
    >
      <view class="add-follow-page">
        <!-- 头部 -->
        <view class="add-header">
          <text class="title">{{ t('mcmNewFollowUp') }}</text>
          <text class="close-txt" @click="closeAddFollowUp">{{ t('close') }}</text>
        </view>

        <!-- 表单内容区域 -->
        <scroll-view scroll-y class="form-scroll">
          <view class="form-item block-item">
            <view class="label required">
              {{ t('mcmFollowUpContent') }}
            </view>
            <view class="textarea-box">
              <wd-textarea
                v-model="followUpForm.trackContent"
                :placeholder="t('mcmFollowUpContentPlaceholder')"
                :maxlength="2000"
                :cursor="trackCursor"
                :selection-start="trackCursor"
                :selection-end="trackCursor"
                show-word-limit
                @focus="handleTrackContentFocus"
                @blur="handleTrackContentBlur"
              />
            </view>
          </view>

          <view class="form-item block-item">
            <view class="label">
              {{ t('mcmNextStep') }}
            </view>
            <view class="textarea-box">
              <wd-textarea
                v-model="followUpForm.nextStep"
                :placeholder="t('mcmNextStepPlaceholder')"
                :maxlength="256"
                :cursor="stepCursor"
                :selection-start="stepCursor"
                :selection-end="stepCursor"
                show-word-limit
                @focus="handleNextStepFocus"
                @blur="handleNextStepBlur"
              />
            </view>
          </view>

          <view class="form-cell">
            <view class="label required">
              {{ t('mcmReturnDate') }}
            </view>
            <picker mode="date" :value="followUpForm.followUpDate" @change="bindDateChange">
              <view class="value-picker">
                {{ followUpForm.followUpDate || t('pleaseSelectDate') }}
              </view>
            </picker>
          </view>

          <view class="form-cell">
            <view class="label required">
              {{ t('mcmFollowUpMethod') }}
            </view>
            <wd-picker
              v-model="followUpForm.followUpMethod"
              :columns="followUpMethodList"
              :title="t('pleaseSelect')"
              @confirm="handleMethodChange"
            >
              <view class="value-picker">
                {{
                  getDictLabel(followUpMethodList, followUpForm.followUpMethod) || t('pleaseSelect')
                }}
              </view>
            </wd-picker>
          </view>

          <view class="form-cell">
            <wd-cell
              :title="t('mcmParticipants')"
              :value="getPersonLabels(followUpForm.participants) || t('pleaseSelectPerson')"
              is-link
              @click="openParticipantsPicker"
            />
          </view>

          <view class="form-cell">
            <view class="label">
              {{ t('mcmShare') }}
            </view>
            <view class="radio-group">
              <view class="radio-item" @click="followUpForm.cc = 0">
                <view class="radio-circle" :class="[followUpForm.cc === 0 ? 'checked' : '']" />
                <text>{{ t('mcmNoCc') }}</text>
              </view>
              <view class="radio-item" @click="followUpForm.cc = 1">
                <view class="radio-circle" :class="[followUpForm.cc === 1 ? 'checked' : '']" />
                <text>{{ t('mcmCc') }}</text>
              </view>
            </view>
          </view>

          <view v-if="followUpForm.cc === 1" class="form-cell">
            <wd-cell
              :title="t('mcmCcPerson')"
              :value="getPersonLabels(followUpForm.ccUsers) || t('pleaseSelectPerson')"
              is-link
              @click="openCcUsersPicker"
            />
          </view>
        </scroll-view>

        <!-- 底部按钮 -->
        <view class="form-footer">
          <button class="footer-btn cancel" @click="closeAddFollowUp">
            {{ t('commonCancel') }}
          </button>
          <button class="footer-btn save" @click="saveFollowUp">
            {{ t('commonSave') }}
          </button>
        </view>

        <!-- 这里的 Picker 用于处理弹窗逻辑，放置在底部以利用层级优势，设为 height:0 隐藏占位 -->
        <view style="height: 0; overflow: hidden">
          <wd-select-picker
            ref="participantsPickerRef"
            v-model="followUpForm.participants"
            :columns="personList"
            :title="t('pleaseSelectPerson')"
            type="checkbox"
            filterable
            :z-index="20000"
            root-portal
            @confirm="handleParticipantChange"
          >
            <template #default>
              <view />
            </template>
          </wd-select-picker>

          <wd-select-picker
            ref="ccUsersPickerRef"
            v-model="followUpForm.ccUsers"
            :columns="personList"
            :title="t('pleaseSelectPerson')"
            type="checkbox"
            filterable
            :z-index="20000"
            root-portal
            @confirm="handleCcPersonChange"
          >
            <template #default>
              <view />
            </template>
          </wd-select-picker>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { t } from '@/locale'
import { apiGetCompanyPersonList, apiSaveTrack } from '@/pages-mcm/service/customer'
import { apiGetDictByType } from '@/service/common'

// --- Props & Emits ---
const emit = defineEmits<{
  'follow-up-saved': []
}>()

// --- 状态 ---
// 跟进弹窗状态
const showCallConfirm = ref(false)
const showAddFollowUp = ref(false)

function getInitialFollowUpForm(customerId = '') {
  return {
    trackContent: '',
    nextStep: '',
    customerId,
    followUpDate: new Date().toISOString().split('T')[0],
    followUpMethod: '',
    cc: 0, // 0: 不抄送, 1: 抄送
    participants: [] as any,
    ccUsers: [] as any,
  }
}

const followUpForm = ref(getInitialFollowUpForm())

// 光标位置控制 (解决企业微信聚焦时光标在最前面的问题)
const trackCursor = ref(-1)
const stepCursor = ref(-1)

function handleTrackContentFocus() {
  const content = followUpForm.value.trackContent || ''
  const len = content.length

  // 核心 Hack：在聚焦时重赋一次值，强制企业微信的原生组件刷新光标位置
  // 有些版本的小程序在值发生变动时会自动将光标推向末尾
  followUpForm.value.trackContent = `${content} `
  nextTick(() => {
    followUpForm.value.trackContent = content
    setTimeout(() => {
      trackCursor.value = len
      console.log(`${trackCursor.value}trackCursor.value`)
    }, 100)
  })
}

function handleTrackContentBlur() {
  trackCursor.value = -1
}

function handleNextStepFocus() {
  const content = followUpForm.value.nextStep || ''
  const len = content.length

  followUpForm.value.nextStep = `${content} `
  nextTick(() => {
    followUpForm.value.nextStep = content
    setTimeout(() => {
      stepCursor.value = len
    }, 100)
  })
}

function handleNextStepBlur() {
  stepCursor.value = -1
}

// 字典数据
const followUpMethodList = ref<any[]>([])

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

// 找对应的label显示
function getDictLabel(list: any[], val: string) {
  if (!val)
    return ''
  const find = list.find(p => p.value === val)
  return find ? find.label : val
}

// 跟进方式选择
function handleMethodChange({ value }: any) {
  followUpForm.value.followUpMethod = value
}

// 人员列表
const personList = ref<any[]>([])

// 获取人员列表
async function getPersonList() {
  try {
    const res = (await apiGetCompanyPersonList()) as any
    const list = res.data.list || []
    personList.value = list.map((item: any) => ({
      label: item.userName,
      value: item.userId,
    }))
  }
  catch (e) {
    console.error('Fetch person list failed', e)
  }
}

// 参与人选择
const participantsPickerRef = ref()
function openParticipantsPicker() {
  participantsPickerRef.value?.open()
}

function handleParticipantChange({ value }: any) {
  followUpForm.value.participants = value?.length ? value.join(',') : ''
}

// 抄送人选择
const ccUsersPickerRef = ref()
function openCcUsersPicker() {
  ccUsersPickerRef.value?.open()
}

function handleCcPersonChange({ value }: any) {
  followUpForm.value.ccUsers = value
}

// 获取人员名称显示
function getPersonLabels(ids: any) {
  if (!ids)
    return ''
  const idArray = Array.isArray(ids) ? ids : String(ids).split(',')
  return personList.value
    .filter(item => idArray.includes(item.value))
    .map(item => item.label)
    .join(',')
}

// 当前打电话的联系人
const currentContact = ref<any>({})
const isCalling = ref(false)

// 拨打电话 - 对外暴露的方法
function makeCall(contactInfo: { contactPhone: string, id: string }) {
  currentContact.value = contactInfo
  const phone = (contactInfo?.contactPhone || '').toString().trim()
  if (!phone) {
    uni.showToast({ title: t('noAvailablePhone'), icon: 'none' })
    return
  }

  // 标记正在拨打电话
  isCalling.value = true
  uni.makePhoneCall({
    phoneNumber: phone,
    success: () => {
      // 拨号成功不直接弹窗，而是等回到页面(onShow)再判断
    },
    fail: () => {
      // 失败则重置标记
      isCalling.value = false
    },
  })
}

// 监听页面显示，用于判断是否从拨号界面返回
onShow(() => {
  if (isCalling.value) {
    isCalling.value = false
    // 延迟一点显示，避免与系统本身的回调冲突或过快
    setTimeout(() => {
      showCallConfirm.value = true
    }, 500)
  }
})

// 关闭通话确认
function closeCallConfirm() {
  showCallConfirm.value = false
}

// 打开新建跟进
function toAddFollowUp() {
  showCallConfirm.value = false
  // 重置表单
  followUpForm.value = getInitialFollowUpForm(currentContact.value.id)
  showAddFollowUp.value = true
}

// 关闭新建跟进
function closeAddFollowUp() {
  showAddFollowUp.value = false
}

// 日期选择
function bindDateChange(e: any) {
  followUpForm.value.followUpDate = e.detail.value
}

// 保存跟进
async function saveFollowUp() {
  // 校验跟进内容
  if (!followUpForm.value.trackContent) {
    uni.showToast({ title: t('pleaseInputContent'), icon: 'none' })
    return
  }

  // 校验回访日期
  if (!followUpForm.value.followUpDate) {
    uni.showToast({ title: t('pleaseSelectDate'), icon: 'none' })
    return
  }

  // 校验跟进方式
  if (!followUpForm.value.followUpMethod) {
    uni.showToast({ title: t('pleaseSelectFollowUpMethod'), icon: 'none' })
    return
  }

  // 判断参与人是不是字符串，如果不是字符串则转为字符串
  if (typeof followUpForm.value.participants !== 'string') {
    followUpForm.value.participants = (followUpForm.value.participants as any[])?.join(',')
  }

  uni.showLoading({ title: '保存中' })
  try {
    // 调用保存接口
    await apiSaveTrack(followUpForm.value)
    uni.showToast({ title: t('saveSuccess'), icon: 'success' })
    setTimeout(() => {
      showAddFollowUp.value = false
      emit('follow-up-saved')
    }, 1000)
  }
  catch (error) {
    console.error('保存失败', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
  finally {
    uni.hideLoading()
  }
}

// 初始化数据
onMounted(() => {
  getPersonList()
  getFollowUpMethodList()
})

// 打开跟进弹窗方法
function openFollowUp(customerId: string) {
  currentContact.value = { id: customerId }
  followUpForm.value = getInitialFollowUpForm(customerId)
  showAddFollowUp.value = true
}

// 暴露方法给父组件
defineExpose({
  makeCall,
  openFollowUp,
})
</script>

<style lang="scss" scoped>
// 确认弹窗样式
.confirm-popup {
  background: #fff;
  padding: 30px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .icon-area {
    margin-bottom: 16px;

    .warn-icon {
      width: 50px;
      height: 50px;
      background-color: #f0ad4e;
      border-radius: 50%;
      color: #fff;
      font-size: 32px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .confirm-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }

  .confirm-desc {
    font-size: 14px;
    color: #999;
    text-align: center;
    margin-bottom: 24px;
  }

  .confirm-btns {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .btn {
      width: 45%;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      border-radius: 4px;

      &.cancel {
        background-color: #fff;
        border: 1px solid #ddd;
        color: #666;
      }

      &.primary {
        background-color: #409eff;
        color: #fff;
        border: none;
      }

      &::after {
        border: none;
      }
    }
  }
}

// 新增跟进弹窗样式
.add-follow-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;

  .add-header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #eee;

    .title {
      font-size: 16px;
      font-weight: bold;
    }

    .close-txt {
      font-size: 14px;
      color: #666;
    }
  }

  .form-scroll {
    flex: 1;
    padding: 16px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .form-item {
    margin-bottom: 20px;

    .label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;

      &.required::before {
        content: '*';
        color: red;
        margin-right: 2px;
      }
    }

    .textarea-box {
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 10px;
      position: relative;

      .input-area {
        width: 100%;
        height: 100px;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
      }

      .word-count {
        text-align: right;
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .form-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f9f9f9;

    .label {
      font-size: 14px;
      color: #333;

      &.required::before {
        content: '*';
        color: red;
        margin-right: 2px;
      }
    }

    .value-picker,
    .value-text {
      font-size: 14px;
      color: #333;
    }

    .value-placeholder {
      font-size: 14px;
      color: #999;
    }

    .radio-group {
      display: flex;

      .radio-item {
        display: flex;
        align-items: center;
        margin-left: 20px;

        .radio-circle {
          width: 16px;
          height: 16px;
          border: 1px solid #ccc;
          border-radius: 50%;
          margin-right: 6px;
          position: relative;

          &.checked {
            border-color: #2979ff;

            &::after {
              content: '';
              position: absolute;
              width: 8px;
              height: 8px;
              background-color: #2979ff;
              border-radius: 50%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }

        text {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }

  .form-footer {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #eee;
    background-color: #fff;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));

    .footer-btn {
      width: 48%;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      border-radius: 4px;

      &.cancel {
        background-color: #f5f5f5;
        color: #666;
        border: none;
      }

      &.save {
        background-color: #409eff;
        color: #fff;
        border: none;
      }

      &::after {
        border: none;
      }
    }
  }
}
</style>
