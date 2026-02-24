<!--
  * @description mcm - 客户管理 - 常用收发人 新增、编辑（内容待补充）
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="consigner-form-page">
    <wd-toast />
    <wd-navbar
      :bordered="false"
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      :title="isEdit ? '编辑常用收发人' : '新增常用收发人'"
      custom-style="background-color: #eae6ff !important;"
      @click-left="handleGeneralBack"
    />

    <view class="content-wrapper">
      <wd-form ref="formRef" :model="model" :rules="rules" label-width="120px">
        <wd-cell-group border>
          <wd-input
            v-model="model.consignerInfo"
            :rules="[{ required: true, message: '请填写收发人信息' }]"
            clearable
            label="收发人信息"
            label-width="120px"
            placeholder="请输入收发人信息"
            prop="consignerInfo"
          />

          <wd-cell center prop="consignerType" title="收发人类型" title-width="120px">
            <wd-radio-group v-model="model.consignerType" inline shape="dot">
              <wd-radio :value="2">
                收货人
              </wd-radio>
              <wd-radio :value="1">
                发货人
              </wd-radio>
            </wd-radio-group>
          </wd-cell>

          <wd-cell center prop="isCommonUse" title="是否设为常用" title-width="120px">
            <wd-switch v-model="model.isCommonUse" :active-value="1" :inactive-value="0" />
          </wd-cell>
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
  mcmConsignerDetail,
  mcmConsignerSave,
  mcmConsignerUpdate,
} from '@/pages-mcm/service/consigner'
import { handleGeneralBack } from '@/utils/function'

// 路由参数：id 存在则视为编辑；customerId 用于新增时关联客户
const routeOptions = ref<{ id?: string, customerId?: string }>({})
const isEdit = computed(() => !!routeOptions.value.id)

const { success: showSuccess, error: showError } = useToast()
const formRef = ref()

const model = reactive({
  id: '',
  customerId: '',
  consignerType: 2 as number,
  consignerInfo: '',
  isCommonUse: 0 as number, // 默认 0，不可修改
})

const rules = {
  consignerInfo: [{ required: true, message: '请填写收发人信息' }],
  consignerType: [{ required: true, message: '请选择收发人类型' }],
}

function syncCustomerId() {
  const cid = routeOptions.value.customerId ? String(routeOptions.value.customerId) : ''
  model.customerId = cid
}

async function getDetail() {
  if (!isEdit.value || !routeOptions.value.id)
    return
  try {
    const { data } = await mcmConsignerDetail(routeOptions.value.id)
    if (data && typeof data === 'object') {
      model.consignerInfo = (data as any).consignerInfo ?? ''
      model.consignerType = Number((data as any).consignerType ?? model.consignerType)
      // isCommonUse 保持默认值 0，不可修改
    }
  }
  catch (e) {
    console.error('获取常用收发人详情失败', e)
    showError({ msg: '获取详情失败' })
  }
}

async function handleSubmit() {
  try {
    const { valid } = await formRef.value?.validate()
    if (!valid) {
      return
    }

    const submitData: any = {
      customerId: model.customerId,
      consignerType: model.consignerType,
      consignerInfo: model.consignerInfo,
      isCommonUse: model.isCommonUse,
      publicType: 0, // 固定为 0，不可修改
    }

    if (isEdit.value) {
      await mcmConsignerUpdate({ ...submitData, id: routeOptions.value.id })
      showSuccess({ msg: '编辑成功' })
    }
    else {
      if (!submitData.customerId) {
        showError({ msg: '缺少客户ID' })
        return
      }
      await mcmConsignerSave(submitData)
      showSuccess({ msg: '新增成功' })
    }

    // 发送刷新事件
    uni.$emit('refreshConsignerList')

    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  }
  catch (_) {}
}

onLoad((options) => {
  routeOptions.value = (options || {}) as any
  syncCustomerId()
  model.id = routeOptions.value.id ? String(routeOptions.value.id) : ''
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
.consigner-form-page {
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

:deep(.wd-radio-group) {
  display: flex;
  gap: 20rpx;
}

:deep(.wd-cell__value) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
