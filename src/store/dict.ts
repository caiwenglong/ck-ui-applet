import { defineStore } from 'pinia'
import { apiGetDictByType, getAllDict } from '@/service'

export const useDictStore = defineStore('dict', () => {
  const dictList = ref({})
  const dicts = new Map()
  const getDict = async (dictType?: string) => {
    // 判断 dict Lis 是否为空
    if (!dictList.value || Object.keys(dictList.value).length === 0) {
      const { data } = await getAllDict()
      dictList.value = data
      return dictList.value[dictType]
    }
    else {
      return dictList.value[dictType]
    }
  }

  // 清除所有的字典并且重新获取
  const clearDict = () => {
    dictList.value = {}
    dicts.clear()
  }

  // 获取字典给下拉列表使用
  const getDictList = (dictType?: string) => {
    return dictList.value[dictType]
      ? dictList.value[dictType].map((item: any) => {
          return {
            label: item.dictLabel,
            value: item.dictValue,
          }
        })
      : []
  }

  /**
   * 通过类型获取字典
   * @param type
   */
  const getDictByType = async (type: string) => {
    if (dicts.get(type)) {
      return dicts.get(type)
    }
    const { data } = await apiGetDictByType(type)
    dicts.set(type, data)
    return data
  }

  return {
    dictList,
    getDict,
    getDictByType,
    dicts,
    getDictList,
    clearDict,
  }
})
