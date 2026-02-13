import { defineStore } from 'pinia'

const useCommonStore = defineStore('commonStore', () => {
  const tabbarValue = ref(0)

  // 修改tabbarValue
  const setTabbarValue = (value: number) => {
    tabbarValue.value = value
  }

  // 导出
  return {
    tabbarValue,
    setTabbarValue,
  }
})

export default useCommonStore
