<!--
  * @description 客户表单标签页组件 - 整合联系人、业务信息、负责人三个组件
-->
<template>
  <view class="customer-form-tabs">
    <wd-tabs v-model="activeTab" lineable custom-class="form-tabs">
      <wd-tab title="联系人" name="contact">
        <view class="tab-content">
          <CustomerContactPerson key="contact" v-model="formData.contactList" />
        </view>
      </wd-tab>
      <wd-tab title="业务信息" name="business">
        <view class="tab-content">
          <CustomerBusinessInfo key="business" v-model="formData" />
        </view>
      </wd-tab>
      <wd-tab title="负责人" name="charge">
        <view class="tab-content">
          <CustomerChargePerson key="charge" v-model="formData" :is-edit="isEdit" />
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import type { CustomerFormData } from '@/pages-mcm/type/customer'
import CustomerBusinessInfo from './CustomerBusinessInfo.vue'
import CustomerChargePerson from './CustomerChargePerson.vue'
import CustomerContactPerson from './CustomerContactPerson.vue'

const props = defineProps<{
  modelValue: CustomerFormData
  isEdit?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CustomerFormData]
}>()

const activeTab = ref('contact')
const isEdit = computed(() => props.isEdit ?? false)

const formData = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 初始化默认数据
function initDefaultData() {
  const defaultData: Partial<CustomerFormData> = {
    contactList: formData.value.contactList?.length
      ? formData.value.contactList
      : [
          {
            contactName: '',
            contactPhone: '',
            post: '',
            email: '',
            wechat: '',
            qq: '',
            remark: '',
          },
        ],
    goodsIds: formData.value.goodsIds ?? '',
    goodsNames: formData.value.goodsNames ?? '',
    fundingRequirements: formData.value.fundingRequirements ?? '',
    annualScale: formData.value.annualScale ?? '',
    importCountry: formData.value.importCountry ?? '',
    importPort: formData.value.importPort ?? '',
    importGoods: formData.value.importGoods ?? '',
    annualExportScale: formData.value.annualExportScale ?? '',
    exportCountry: formData.value.exportCountry ?? '',
    exportPort: formData.value.exportPort ?? '',
    exportGoods: formData.value.exportGoods ?? '',
    remark: formData.value.remark ?? '',
    salesmanId: formData.value.salesmanId ?? '',
    salesmanName: formData.value.salesmanName ?? '',
    assistantIds: formData.value.assistantIds ?? '',
  }
  Object.assign(formData.value, defaultData)
}

onMounted(() => {
  initDefaultData()
})
</script>

<style lang="scss" scoped>
.customer-form-tabs {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.tab-content {
  padding: 20rpx;
}

:deep(.form-tabs) {
  .wd-tabs__nav {
    background: #fff;
  }

  .wd-tabs__content {
    padding: 0;
  }
}
</style>
