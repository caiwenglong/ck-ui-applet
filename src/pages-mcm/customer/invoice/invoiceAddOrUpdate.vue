<!--
  * @description mcm - 客户管理 - 发票信息 新增、编辑
-->
<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="invoice-form-page">
    <wd-toast />
    <wd-navbar
      :bordered="false"
      :fixed="true"
      :left-arrow="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      :title="isEdit ? '编辑发票信息' : '新增发票信息'"
      custom-style="background-color: #eae6ff !important;"
      @click-left="handleGeneralBack"
    />

    <view class="content-wrapper">
      <wd-form ref="formRef" :model="model" :rules="rules" label-width="120px">
        <wd-cell-group border>
          <wd-input
            v-model="model.accountUser"
            :rules="[{ required: true, message: '请填写发票抬头' }]"
            clearable
            label="发票抬头"
            label-width="120px"
            placeholder="请输入发票抬头"
            prop="accountUser"
          />

          <wd-input
            v-model="model.taxCode"
            clearable
            label="纳税人识别号"
            label-width="120px"
            placeholder="请输入纳税人识别号"
            prop="taxCode"
          />

          <wd-input
            v-model="model.bankName"
            :rules="[{ required: true, message: '请填写开户行' }]"
            clearable
            label="开户行"
            label-width="120px"
            placeholder="请输入开户行"
            prop="bankName"
          />

          <wd-input
            v-model="model.accountNo"
            :rules="[{ required: true, message: '请填写账号' }]"
            clearable
            label="账号"
            label-width="120px"
            placeholder="请输入账号"
            prop="accountNo"
          />

          <wd-input
            v-model="model.address"
            clearable
            label="地址"
            label-width="120px"
            placeholder="请输入地址"
            prop="address"
          />

          <wd-input
            v-model="model.phone"
            clearable
            label="电话"
            label-width="120px"
            placeholder="请输入电话"
            prop="phone"
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
  mcmInvoiceDetail,
  mcmInvoiceSave,
  mcmInvoiceUpdate,
} from '@/pages-mcm/service/invoice'
import { handleGeneralBack } from '@/utils/function'

// 路由参数：id 存在则视为编辑；customerId 用于新增时关联客户
const routeOptions = ref<{ id?: string, customerId?: string }>({})
const isEdit = computed(() => !!routeOptions.value.id)

const { success: showSuccess, error: showError } = useToast()
const formRef = ref()

const model = reactive({
  id: '',
  customerId: '',
  accountUser: '',
  taxCode: '',
  bankName: '',
  accountNo: '',
  address: '',
  phone: '',
})

const rules = {
  accountUser: [{ required: true, message: '请填写发票抬头' }],
  bankName: [{ required: true, message: '请填写开户行' }],
  accountNo: [{ required: true, message: '请填写账号' }],
}

function syncCustomerId() {
  const cid = routeOptions.value.customerId ? String(routeOptions.value.customerId) : ''
  model.customerId = cid
}

async function getDetail() {
  if (!isEdit.value || !routeOptions.value.id)
    return
  try {
    const { data } = await mcmInvoiceDetail(routeOptions.value.id)
    if (data && typeof data === 'object') {
      model.accountUser = (data as any).accountUser ?? ''
      model.taxCode = (data as any).taxCode ?? ''
      model.bankName = (data as any).bankName ?? ''
      model.accountNo = (data as any).accountNo ?? ''
      model.address = (data as any).address ?? ''
      model.phone = (data as any).phone ?? ''
    }
  }
  catch (e) {
    console.error('获取发票信息详情失败', e)
    showError({ msg: '获取详情失败' })
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()

    const submitData: any = {
      customerId: model.customerId,
      accountUser: model.accountUser,
      taxCode: model.taxCode,
      bankName: model.bankName,
      accountNo: model.accountNo,
      address: model.address,
      phone: model.phone,
    }

    if (isEdit.value) {
      await mcmInvoiceUpdate({ ...submitData, id: routeOptions.value.id })
      showSuccess({ msg: '编辑成功' })
    }
    else {
      if (!submitData.customerId) {
        showError({ msg: '缺少客户ID' })
        return
      }
      await mcmInvoiceSave(submitData.customerId, submitData)
      showSuccess({ msg: '新增成功' })
    }

    // 发送刷新事件
    uni.$emit('refreshInvoiceList')

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
.invoice-form-page {
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
