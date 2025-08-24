import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('bg-red-500', 'text-white')
    expect(result).toBe('bg-red-500 text-white')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', {
      'active-class': isActive,
      'inactive-class': !isActive
    })
    expect(result).toBe('base-class active-class')
  })

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('should handle conflicting Tailwind classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('should handle undefined and null values', () => {
    const result = cn('valid-class', null, undefined, 'another-class')
    expect(result).toBe('valid-class another-class')
  })

  it('should handle empty strings', () => {
    const result = cn('class1', '', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle responsive classes correctly', () => {
    const result = cn('w-full', 'md:w-1/2', 'lg:w-1/3')
    expect(result).toBe('w-full md:w-1/2 lg:w-1/3')
  })

  it('should merge similar but different classes', () => {
    const result = cn('p-4', 'px-6') // padding should be overridden by px
    expect(result).toBe('p-4 px-6')
  })
})
