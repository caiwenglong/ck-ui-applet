<!--
  * @description mcm - 客户管理 - 客户SOP 新增、编辑
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="sop-form-page">
    <wd-toast />
    <wd-navbar
      :bordered="false"
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      :title="isEdit ? '编辑客户SOP' : '新增客户SOP'"
      custom-style="background-color: #eae6ff !important;"
      @click-left="handleGeneralBack"
    />

    <view class="content-wrapper">
      <wd-form ref="formRef" :model="model" :rules="rules" label-width="120px">
        <wd-cell-group border>
          <wd-picker
            v-model="model.sopType"
            :columns="sopTypeOptions"
            :rules="[{ required: true, message: '请选择SOP类型' }]"
            label="SOP类型"
            label-width="120px"
            placeholder="请选择SOP类型"
            prop="sopType"
            value-key="value"
            label-key="label"
          />

          <wd-textarea
            v-model="model.sopValue"
            :rules="[{ required: true, message: '请填写内容' }]"
            :maxlength="500"
            clearable
            label="内容"
            label-width="120px"
            placeholder="请输入内容"
            prop="sopValue"
            show-word-limit
            type="textarea"
          />
        </wd-cell-group>
      </wd-form>

      <view class="footer">
        <wd-button custom-class="btn-cancel" size="large" plain block @click="handleGeneralBack">
          取消
        </wd-button>
        <wd-button block custom-class="btn-save" size="large" type="primary" @click="handleSubmit">
          保存
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import {
  mcmCustomerSopDetail,
  mcmCustomerSopSave,
  mcmCustomerSopUpdate,
} from '@/pages-mcm/service/customer'
import { useDictStore } from '@/store/dict'
import { handleGeneralBack, transformDictI18n } from '@/utils/function'

// 路由参数：id 存在则视为编辑；customerId 用于新增时关联客户
const routeOptions = ref<{ id?: string, customerId?: string }>({})
const isEdit = computed(() => !!routeOptions.value.id)

const { success: showSuccess, error: showError } = useToast()
const formRef = ref()
const dictStore = useDictStore()

// SOP类型选项
const sopTypeOptions = ref<Array<{ label: string, value: string | number }>>([])

// 表单数据
const model = reactive({
  id: '',
  customerId: '',
  sopType: '' as string | number,
  sopValue: '',
})

const rules = {
  sopType: [{ required: true, message: '请选择SOP类型' }],
  sopValue: [{ required: true, message: '请填写内容' }],
}

// 加载SOP类型字典
async function loadSopTypeDict() {
  try {
    const dictData = await dictStore.getDictByType('sop_type')
    if (Array.isArray(dictData)) {
      sopTypeOptions.value = dictData.map((item: any) => ({
        label: transformDictI18n(item),
        value: item.dictValue,
      }))
    }
  }
  catch (e) {
    console.error('获取SOP类型字典失败', e)
  }
}

function syncCustomerId() {
  const cid = routeOptions.value.customerId ? String(routeOptions.value.customerId) : ''
  model.customerId = cid
}

async function getDetail() {
  if (!isEdit.value || !routeOptions.value.id)
    return
  try {
    const { data } = await mcmCustomerSopDetail(routeOptions.value.id)
    if (data && typeof data === 'object') {
      model.sopType = (data as any).sopType ?? ''
      model.sopValue = (data as any).sopValue ?? ''
    }
  }
  catch (e) {
    console.error('获取客户SOP详情失败', e)
    showError({ msg: '获取详情失败' })
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()

    const submitData: any = {
      customerId: model.customerId,
      sopType: model.sopType,
      sopValue: model.sopValue,
    }

    if (isEdit.value) {
      await mcmCustomerSopUpdate({ ...submitData, id: routeOptions.value.id })
      showSuccess({ msg: '编辑成功' })
    }
    else {
      if (!submitData.customerId) {
        showError({ msg: '缺少客户ID' })
        return
      }
      await mcmCustomerSopSave(submitData.customerId, submitData)
      showSuccess({ msg: '新增成功' })
    }

    // 发送刷新事件
    uni.$emit('refreshSopList')

    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  }
  catch (_) {}
}

onLoad(async (options) => {
  routeOptions.value = (options || {}) as any
  syncCustomerId()
  model.id = routeOptions.value.id ? String(routeOptions.value.id) : ''

  // 加载字典数据
  await loadSopTypeDict()

  if (isEdit.value)
    getDetail()
})
</script>

<style>
page {
  background: #eae6ff;
}
</style>

<style lang="scss" scoped>
.sop-form-page {
  min-height: 100vh;
  background: #eae6ff;
}

.content-wrapper {
  padding: 20rpx;
  padding-top: 20rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 54px);
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  z-index: 2;
  background: #eae6ff;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

:deep(.btn-cancel),
:deep(.btn-save) {
  flex: 1;
  width: 100% !important;
}

:deep(.btn-cancel .wd-button),
:deep(.btn-save .wd-button) {
  width: 100% !important;
}

:deep(.wd-cell-group) {
  margin-bottom: 20rpx;
}

:deep(.wd-cell__value) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
