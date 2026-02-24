<!--
  * @description 客户业务信息组件
-->
<template>
  <wd-cell-group border>
    <GoodsTagSelector
      v-model="model.goodsIds" :display-names="model.goodsNames" label="主营品名" label-width="120px"
      placeholder="请选择主营品名" prop="goodsIds" @update:display-names="setGoodsNames"
    />
    <wd-input
      v-model="model.fundingRequirements" clearable label="资金需求" label-width="120px" placeholder="请输入资金需求"
      prop="fundingRequirements"
    />
    <wd-input
      v-model="model.annualScale" clearable label="年进口量规模" label-width="120px" placeholder="请输入年进口量规模"
      prop="annualScale"
    />
    <wd-input
      v-model="model.importCountry" clearable label="进口国" label-width="120px" placeholder="请输入进口国"
      prop="importCountry"
    />
    <wd-input
      v-model="model.importPort" clearable label="进口口岸" label-width="120px" placeholder="请输入进口口岸"
      prop="importPort"
    />
    <wd-input
      v-model="model.importGoods" clearable label="进口产品" label-width="120px" placeholder="请输入进口产品"
      prop="importGoods"
    />
    <wd-input
      v-model="model.annualExportScale" clearable label="年出口量规模" label-width="120px" placeholder="请输入年出口量规模"
      prop="annualExportScale"
    />
    <wd-input
      v-model="model.exportCountry" clearable label="出口国" label-width="120px" placeholder="请输入出口国"
      prop="exportCountry"
    />
    <wd-input
      v-model="model.exportPort" clearable label="出口口岸" label-width="120px" placeholder="请输入出口口岸"
      prop="exportPort"
    />
    <wd-input
      v-model="model.exportGoods" clearable label="出口产品" label-width="120px" placeholder="请输入出口产品"
      prop="exportGoods"
    />
    <wd-textarea
      v-model="model.remark" :maxlength="1000" clearable label="备注信息" label-width="120px"
      placeholder="请输入备注信息" prop="remark" show-word-limit
    />
  </wd-cell-group>
</template>

<script lang="ts" setup>
import type { BusinessInfo } from '@/pages-mcm/type/customer'
import GoodsTagSelector from './GoodsTagSelector.vue'

const props = defineProps<{
  modelValue: BusinessInfo & { [key: string]: any }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BusinessInfo & { [key: string]: any }]
}>()

const model = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

function setGoodsNames(names: string) {
  emit('update:modelValue', { ...props.modelValue, goodsNames: names })
}
</script>

<style lang="scss" scoped></style>
