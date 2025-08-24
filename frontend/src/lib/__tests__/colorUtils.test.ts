import { describe, it, expect } from 'vitest'
import { hexToHSL, hexToHSLString } from '../colorUtils'

describe('colorUtils', () => {
  describe('hexToHSL', () => {
    it('should convert white correctly', () => {
      expect(hexToHSL('#ffffff')).toBe('0 0% 100%')
      expect(hexToHSL('ffffff')).toBe('0 0% 100%') // without #
    })

    it('should convert black correctly', () => {
      expect(hexToHSL('#000000')).toBe('0 0% 0%')
      expect(hexToHSL('000000')).toBe('0 0% 0%') // without #
    })

    it('should convert red correctly', () => {
      expect(hexToHSL('#ff0000')).toBe('0 100% 50%')
    })

    it('should convert green correctly', () => {
      expect(hexToHSL('#00ff00')).toBe('120 100% 50%')
    })

    it('should convert blue correctly', () => {
      expect(hexToHSL('#0000ff')).toBe('240 100% 50%')
    })

    it('should convert gray colors correctly', () => {
      expect(hexToHSL('#808080')).toBe('0 0% 50%')
      expect(hexToHSL('#cccccc')).toBe('0 0% 80%')
    })

    it('should convert purple colors correctly', () => {
      expect(hexToHSL('#8B5CF6')).toBe('258 90% 66%') // Tailwind purple-500
    })

    it('should convert custom brand colors correctly', () => {
      expect(hexToHSL('#3B82F6')).toBe('217 91% 60%') // Tailwind blue-500
      expect(hexToHSL('#10B981')).toBe('160 84% 39%') // Tailwind emerald-500
    })

    it('should handle lowercase hex values', () => {
      expect(hexToHSL('#3b82f6')).toBe('217 91% 60%')
    })

    it('should handle mixed case hex values', () => {
      expect(hexToHSL('#3B82f6')).toBe('217 91% 60%')
    })
  })

  describe('hexToHSLString', () => {
    it('should return HSL string format', () => {
      expect(hexToHSLString('#ffffff')).toBe('hsl(0 0% 100%)')
      expect(hexToHSLString('#ff0000')).toBe('hsl(0 100% 50%)')
      expect(hexToHSLString('#00ff00')).toBe('hsl(120 100% 50%)')
      expect(hexToHSLString('#0000ff')).toBe('hsl(240 100% 50%)')
    })

    it('should handle hex values without # prefix', () => {
      expect(hexToHSLString('ffffff')).toBe('hsl(0 0% 100%)')
      expect(hexToHSLString('ff0000')).toBe('hsl(0 100% 50%)')
    })
  })

  describe('edge cases', () => {
    it('should handle very dark colors', () => {
      expect(hexToHSL('#010101')).toBe('0 0% 0%') // Almost black
    })

    it('should handle very light colors', () => {
      expect(hexToHSL('#fefefe')).toBe('0 0% 100%') // Almost white
    })

    it('should handle mid-tone colors', () => {
      const result = hexToHSL('#7F7F7F') // Mid gray
      expect(result).toBe('0 0% 50%')
    })
  })
})
