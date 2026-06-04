import { describe, it, expect } from 'vitest'
import { sanitizeInput, sanitizeObject } from '@/lib/sanitize'

describe('sanitizeInput', () => {
  it('temel HTML etiketlerini temizler', () => {
    const input = '<script>alert("XSS")</script>Hello'
    const result = sanitizeInput(input)
    expect(result).toBe('Hello')
  })

  it('bağlantıları temizler', () => {
    const input = '<a href="https://evil.com">Link</a>'
    const result = sanitizeInput(input)
    expect(result).toBe('Link')
  })

  it('normal metni değiştirmez', () => {
    const input = 'Merhaba Dünya!'
    const result = sanitizeInput(input)
    expect(result).toBe(input)
  })
})

describe('sanitizeObject', () => {
  it('nesnedeki tüm string alanları temizler', () => {
    const obj = {
      name: '<b>John</b>',
      email: 'john@example.com',
      age: 30,
      nested: {
        bio: '<script>evil</script>Hi there'
      }
    }
    const result = sanitizeObject(obj)
    expect(result.name).toBe('John')
    expect(result.email).toBe('john@example.com')
    expect(result.age).toBe(30)
    expect(result.nested.bio).toBe('Hi there')
  })
})
