// 点击 N 次触发事件的 hook

export function useSecretTap(callback: () => void, threshold = 10, timeout = 2000) {
  const tapCount = ref(0)
  let timer: ReturnType<typeof setTimeout> | null = null

  const handleTap = () => {
    tapCount.value += 1

    // 每次点击后 timeout 毫秒内未再次点击就重置
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      tapCount.value = 0
    }, timeout)

    if (tapCount.value >= threshold) {
      tapCount.value = 0
      callback() // 达到阈值后执行回调
    }
  }

  return {
    handleTap,
  }
}
