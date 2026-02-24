import { defineStore } from 'pinia'
import { apiGetCountryRegionTree } from '@/service/common'

export const useCountryRegionStore = defineStore(
  'countryRegion',
  () => {
    const countryRegion = ref<any[]>([])

    const aGetCountryRegion = async () => {
      const { data } = await apiGetCountryRegionTree()
      countryRegion.value = data
    }

    return {
      aGetCountryRegion,
      countryRegion,
    }
  },
  {
    persist: true, // 启用持久化，页面刷新后，状态不会丢失，仍能保留之前的数据。
  },
)
