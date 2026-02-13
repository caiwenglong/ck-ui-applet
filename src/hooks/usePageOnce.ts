import { onLoad, onShow } from '@dcloudio/uni-app'

export function usePageOnce(onFirstLoad: (opt?: any) => void, onReShow?: () => void) {
  const hasLoaded = ref(false)
  let delayMark = false // 用于避免首次进入时 onShow 被执行

  onLoad((opt) => {
    delayMark = true
    onFirstLoad(opt)

    // 设置一个微延迟，等 onShow 执行完之后再标记为已加载
    setTimeout(() => {
      hasLoaded.value = true
      delayMark = false
    }, 100) // 100ms 已足够跨过 onShow
  })

  onShow(() => {
    if (hasLoaded.value && !delayMark) {
      onReShow?.()
    }
  })
}
