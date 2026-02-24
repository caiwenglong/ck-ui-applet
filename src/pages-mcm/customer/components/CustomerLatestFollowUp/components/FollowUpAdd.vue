<!--
  * @description 新增跟进弹窗组件
-->
<template>
  <wd-popup
    v-model="visible" position="bottom"
    custom-style="border-radius: 16px 16px 0 0; height: 85vh; display: flex; flex-direction: column; z-index: 1000;"
    @close="handleClose"
  >
    <view class="add-follow-page">
      <!-- 头部 -->
      <view class="add-header">
        <text class="title">新增跟进</text>
        <text class="close-txt" @click="handleClose">关闭</text>
      </view>

      <!-- 表单内容区域 -->
      <view class="form-scroll">
        <!-- 跟进内容 -->
        <view class="form-item block-item">
          <view class="label required">
            跟进内容
          </view>
          <view class="textarea-box">
            <wd-textarea
              v-model="formData.trackContent" placeholder="请输入跟进内容" :maxlength="1000" :cursor="trackCursor"
              :selection-start="trackCursor" :selection-end="trackCursor" show-word-limit
              @focus="handleTrackContentFocus" @blur="handleTrackContentBlur"
            />
          </view>
        </view>

        <!-- 下一步任务 -->
        <view class="form-item block-item">
          <view class="label">
            下一步任务
          </view>
          <view class="textarea-box">
            <wd-textarea
              v-model="formData.nextStep" placeholder="请输入下一步任务" :maxlength="256" :cursor="stepCursor"
              :selection-start="stepCursor" :selection-end="stepCursor" show-word-limit
              @focus="handleNextStepFocus" @blur="handleNextStepBlur"
            />
          </view>
        </view>

        <!-- 回访日期 -->
        <view class="form-cell">
          <view class="label required">
            回访日期
          </view>
          <picker mode="date" :value="formData.followUpDate" @change="bindDateChange">
            <view class="value-picker">
              {{ formData.followUpDate || '请选择日期' }}
            </view>
          </picker>
        </view>

        <!-- 跟进方式 -->
        <view class="form-cell">
          <view class="label required">
            跟进方式
          </view>
          <view class="value-picker" @click="openFollowUpMethodPicker">
            {{ getDictLabel(followUpMethodList, formData.followUpMethod) || '请选择' }}
          </view>
        </view>

        <!-- 参与人 -->
        <view class="form-cell">
          <view class="label">
            参与人
          </view>
          <view class="value-picker" @click="openParticipantsPicker">
            {{ getPersonLabels(formData.participants) || '请选择人员' }}
          </view>
        </view>

        <!-- 地点 -->
        <view class="form-cell">
          <view class="label">
            地点
          </view>
          <wd-input v-model="formData.location" placeholder="请输入地点" :maxlength="128" clearable />
        </view>

        <!-- 抄送 -->
        <view class="form-cell">
          <view class="label">
            抄送
          </view>
          <view class="radio-group">
            <view class="radio-item" @click="formData.cc = 0">
              <view class="radio-circle" :class="[formData.cc === 0 ? 'checked' : '']" />
              <text>不抄送</text>
            </view>
            <view class="radio-item" @click="formData.cc = 1">
              <view class="radio-circle" :class="[formData.cc === 1 ? 'checked' : '']" />
              <text>抄送</text>
            </view>
          </view>
        </view>

        <!-- 抄送人员（条件显示） -->
        <view v-if="formData.cc === 1" class="form-cell">
          <view class="label required">
            抄送人员
          </view>
          <view class="value-picker" @click="openCcUsersPicker">
            {{ getCcUserLabels(formData.ccUsers) || '请选择人员' }}
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="form-footer">
        <button class="footer-btn cancel" @click="handleClose">
          取消
        </button>
        <button class="footer-btn save" @click="handleSave">
          保存
        </button>
      </view>

      <!-- 跟进方式选择器 -->
      <view style="height: 0; overflow: hidden">
        <wd-picker
          ref="followUpMethodPickerRef" v-model="formData.followUpMethod" :columns="followUpMethodList"
          title="请选择" :z-index="20000" root-portal @confirm="handleMethodChange"
        >
          <template #default>
            <view />
          </template>
        </wd-picker>
      </view>

      <!-- 参与人选择器 -->
      <view style="height: 0; overflow: hidden">
        <wd-select-picker
          ref="participantsPickerRef" v-model="participantsValue" :columns="personList" title="请选择人员"
          type="checkbox" filterable :z-index="20000" root-portal @confirm="handleParticipantChange"
        >
          <template #default>
            <view />
          </template>
        </wd-select-picker>
      </view>

      <!-- 抄送人员选择器 -->
      <view style="height: 0; overflow: hidden">
        <wd-select-picker
          ref="ccUsersPickerRef" v-model="ccUsersValue" :columns="personList" title="请选择人员"
          type="checkbox" filterable :z-index="20000" root-portal @confirm="handleCcUsersChange"
        >
          <template #default>
            <view />
          </template>
        </wd-select-picker>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { apiGetCompanyPersonList, apiSaveTrack } from '@/pages-mcm/service/customer'
import { apiGetDictByType } from '@/service/common'

const props = defineProps<{
  modelValue: boolean
  customerId: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
  'close': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 表单数据
function getInitialFormData() {
  return {
    trackContent: '',
    nextStep: '',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpMethod: '',
    participants: '',
    location: '',
    cc: 0,
    ccUsers: [] as number[],
    customerId: props.customerId,
  }
}

const formData = ref(getInitialFormData())

// 光标位置控制
const trackCursor = ref(-1)
const stepCursor = ref(-1)

function handleTrackContentFocus() {
  const content = formData.value.trackContent || ''
  const len = content.length
  formData.value.trackContent = `${content} `
  nextTick(() => {
    formData.value.trackContent = content
    setTimeout(() => {
      trackCursor.value = len
    }, 100)
  })
}

function handleTrackContentBlur() {
  trackCursor.value = -1
}

function handleNextStepFocus() {
  const content = formData.value.nextStep || ''
  const len = content.length
  formData.value.nextStep = `${content} `
  nextTick(() => {
    formData.value.nextStep = content
    setTimeout(() => {
      stepCursor.value = len
    }, 100)
  })
}

function handleNextStepBlur() {
  stepCursor.value = -1
}

// 跟进方式字典
const followUpMethodList = ref<any[]>([])

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

function getDictLabel(list: any[], val: string | number) {
  if (!val)
    return ''
  const find = list.find(p => String(p.value) === String(val))
  return find ? find.label : String(val)
}

const followUpMethodPickerRef = ref()

function openFollowUpMethodPicker() {
  followUpMethodPickerRef.value?.open()
}

function handleMethodChange({ value }: any) {
  formData.value.followUpMethod = value
}

// 日期选择
function bindDateChange(e: any) {
  formData.value.followUpDate = e.detail.value
}

// 参与人相关
const personList = ref<any[]>([])
const participantsPickerRef = ref()
const participantsValue = ref<string[]>([])

async function getPersonList() {
  try {
    const res = (await apiGetCompanyPersonList()) as any
    const list = res.data.list || []
    personList.value = list.map((item: any) => ({
      label: item.userName,
      value: String(item.userId),
    }))
  }
  catch (e) {
    console.error('获取人员列表失败', e)
  }
}

function openParticipantsPicker() {
  // 将字符串转换为数组（确保是字符串数组）
  if (formData.value.participants) {
    participantsValue.value = formData.value.participants.split(',').map(id => String(id))
  }
  else {
    participantsValue.value = []
  }
  participantsPickerRef.value?.open()
}

function handleParticipantChange({ value }: any) {
  // value 是字符串数组，转换为逗号分隔的字符串
  formData.value.participants = value?.length ? value.join(',') : ''
}

function getPersonLabels(ids: string) {
  if (!ids)
    return ''
  const idArray = ids.split(',')
  return personList.value
    .filter(item => idArray.includes(item.value))
    .map(item => item.label)
    .join(',')
}

function getCcUserLabels(ids: number[]) {
  if (!ids || ids.length === 0)
    return ''
  const idArray = ids.map(id => String(id))
  return personList.value
    .filter(item => idArray.includes(item.value))
    .map(item => item.label)
    .join(',')
}

// 抄送人员选择相关
const ccUsersPickerRef = ref()
const ccUsersValue = ref<string[]>([])

function openCcUsersPicker() {
  // 将数字数组转换为字符串数组
  if (formData.value.ccUsers && formData.value.ccUsers.length > 0) {
    ccUsersValue.value = formData.value.ccUsers.map(id => String(id))
  }
  else {
    ccUsersValue.value = []
  }
  ccUsersPickerRef.value?.open()
}

function handleCcUsersChange({ value }: any) {
  // 将字符串数组转换为数字数组
  formData.value.ccUsers = value?.length ? value.map((id: string) => Number(id)) : []
}

// 关闭弹窗
function handleClose() {
  visible.value = false
  formData.value = getInitialFormData()
  emit('close')
}

// 保存
async function handleSave() {
  // 校验跟进内容
  if (!formData.value.trackContent.trim()) {
    uni.showToast({ title: '请输入跟进内容', icon: 'none' })
    return
  }

  // 校验回访日期
  if (!formData.value.followUpDate) {
    uni.showToast({ title: '请选择回访日期', icon: 'none' })
    return
  }

  // 校验跟进方式
  if (!formData.value.followUpMethod) {
    uni.showToast({ title: '请选择跟进方式', icon: 'none' })
    return
  }

  // 校验抄送人员
  if (formData.value.cc === 1 && (!formData.value.ccUsers || formData.value.ccUsers.length === 0)) {
    uni.showToast({ title: '请选择抄送人员', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })
  try {
    const submitData = {
      trackContent: formData.value.trackContent,
      nextStep: formData.value.nextStep || '',
      followUpDate: formData.value.followUpDate,
      followUpMethod: formData.value.followUpMethod,
      participants: formData.value.participants || '',
      location: formData.value.location || '',
      cc: formData.value.cc === 1 ? 1 : 0,
      ccUsers: formData.value.cc === 1 ? formData.value.ccUsers : [],
      customerId: String(formData.value.customerId),
    }
    await apiSaveTrack(submitData)
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      handleClose()
      emit('saved')
    }, 1000)
  }
  catch (error) {
    uni.hideLoading()
    console.error('保存失败', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// 监听弹窗打开，初始化数据
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      formData.value = getInitialFormData()
      formData.value.customerId = props.customerId
      getPersonList()
    }
  },
  { immediate: true },
)

// 初始化
onMounted(() => {
  getFollowUpMethodList()
})
</script>

<style lang="scss" scoped>
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

    // 兼容其他浏览器
    scrollbar-width: none;

    // 隐藏滚动条 - 所有平台
    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
      background: transparent;
    }
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
      padding: 6px;

      :deep(.wd-textarea__value) {
        min-height: 56px;
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

    .required-label::before {
      content: '*';
      color: red;
      margin-right: 2px;
    }

    .value-picker {
      font-size: 14px;
      color: #969799;
      flex: 1;
      text-align: right;
      cursor: pointer;
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
          color: #969799;
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
        background-color: #2979ff;
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
