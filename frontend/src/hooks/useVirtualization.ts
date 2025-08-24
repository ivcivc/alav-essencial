import { useState, useEffect, useRef, useMemo } from 'react'

interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  items: any[]
}

interface VirtualizationResult {
  virtualItems: Array<{
    index: number
    start: number
    end: number
    item: any
  }>
  totalHeight: number
  scrollElementProps: {
    ref: React.RefObject<HTMLDivElement>
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void
    style: React.CSSProperties
  }
  getItemProps: (index: number) => {
    style: React.CSSProperties
    key: string | number
  }
}

export function useVirtualization({
  itemHeight,
  containerHeight,
  overscan = 5,
  items
}: VirtualizationOptions): VirtualizationResult {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight

  const virtualItems = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    const start = Math.max(0, visibleStart - overscan)
    const end = Math.min(items.length - 1, visibleEnd + overscan)

    const virtualItems = []
    for (let i = start; i <= end; i++) {
      virtualItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        item: items[i]
      })
    }

    return virtualItems
  }, [scrollTop, itemHeight, containerHeight, overscan, items])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const getItemProps = (index: number) => ({
    style: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: itemHeight,
      transform: `translateY(${index * itemHeight}px)`
    },
    key: index
  })

  return {
    virtualItems,
    totalHeight,
    scrollElementProps: {
      ref: scrollElementRef,
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto'
      }
    },
    getItemProps
  }
}

// Hook para detectar se um elemento está visível (Intersection Observer)
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}

// Hook para debounce (otimização de performance em buscas)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para throttle (otimização de scroll, resize, etc.)
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}
