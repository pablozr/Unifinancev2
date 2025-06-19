import { describe, it, expect } from 'bun:test'

describe('defaultCategories', () => {
  it('deve ser um módulo válido', () => {
    const module = require('./defaultCategories')
    expect(typeof module).toBe('object')
  })

    it('deve exportar categorias padrão', () => {
    const module = require('./defaultCategories')
    const exports = Object.keys(module)
    expect(exports.length > 0).toBe(true)

    // Verifica se pelo menos um export é array ou objeto (categorias)
    const hasData = Object.values(module).some(exp => Array.isArray(exp) || typeof exp === 'object')
    expect(hasData).toBe(true)
  })

  it('deve ter exports nomeados válidos', () => {
    const module = require('./defaultCategories')
    Object.entries(module).forEach(([key, value]) => {
      expect(key.length > 0).toBe(true)
      expect(['function', 'object', 'string', 'number'].includes(typeof value)).toBe(true)
    })
  })
})
