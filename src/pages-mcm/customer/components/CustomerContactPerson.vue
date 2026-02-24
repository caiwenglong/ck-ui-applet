<!--
  * @description 客户联系人组件
-->
<template>
  <wd-cell-group border>
    <view v-for="(contact, index) in contactList" :key="index" class="contact-item">
      <view class="contact-header">
        <text class="contact-title">联系人{{ Number(index) + 1 }}</text>
        <text class="delete-btn" @click="handleDelete(index)">删除</text>
      </view>

      <wd-input
        v-model="contact.contactName"
        :rules="[{ required: true, message: '请填写联系人名称' }]"
        clearable
        label="联系人名称"
        label-width="120px"
        placeholder="请输入联系人名称"
      />
      <wd-input
        v-model="contact.contactPhone"
        :rules="[
          { required: true, message: '请填写电话' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
        ]"
        clearable
        label="电话"
        label-width="120px"
        placeholder="请输入电话"
        type="number"
      />
      <wd-input
        v-model="contact.post"
        clearable
        label="岗位"
        label-width="120px"
        placeholder="请输入岗位"
      />
      <wd-input
        v-model="contact.email"
        clearable
        label="邮箱"
        label-width="120px"
        placeholder="请输入邮箱号"
      />
      <wd-input
        v-model="contact.wechat"
        clearable
        label="微信"
        label-width="120px"
        placeholder="请输入微信号"
      />
      <wd-input
        v-model="contact.qq"
        clearable
        label="QQ"
        label-width="120px"
        placeholder="请输入QQ号"
        type="number"
      />
      <wd-input
        v-model="contact.remark"
        clearable
        label="备注"
        label-width="120px"
        placeholder="请输入备注信息"
      />
    </view>

    <view class="add-contact-btn">
      <wd-button plain size="large" @click="handleAdd">
        + 添加联系人
      </wd-button>
    </view>
  </wd-cell-group>

  <!-- Message Box 用于确认弹窗 -->
  <wd-message-box />
</template>

<script lang="ts" setup>
import type { ContactItem } from '@/pages-mcm/type/customer'
import { useMessage, useToast } from 'wot-design-uni'

const props = defineProps<{
  modelValue: ContactItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ContactItem[]]
}>()

const message = useMessage()
const { error: showError } = useToast()

const contactList = computed({
  get: () => props.modelValue || [],
  set: val => emit('update:modelValue', val),
})

// 添加联系人
function handleAdd() {
  const newContact: ContactItem = {
    contactName: '',
    contactPhone: '',
    post: '',
    email: '',
    wechat: '',
    qq: '',
    remark: '',
  }
  contactList.value = [...contactList.value, newContact]
}

// 删除联系人
function handleDelete(index: number) {
  // 至少需要保留一条数据
  if (contactList.value.length <= 1) {
    showError({ msg: '至少需要保留一条联系人数据' })
    return
  }

  // 显示确认删除弹窗
  message
    .confirm({
      msg: '确定要删除该联系人吗？',
      title: '提示',
    })
    .then(() => {
      // 用户确认删除
      const list = [...contactList.value]
      list.splice(index, 1)
      contactList.value = list
    })
    .catch(() => {
      // 用户取消删除，不做任何操作
    })
}
</script>

<style lang="scss" scoped>
.contact-item {
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
}

.contact-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.delete-btn {
  color: #f56c6c;
  font-size: 28rpx;
}

.add-contact-btn {
  padding: 20rpx;
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
}
</style>
