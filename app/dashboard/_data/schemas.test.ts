import { describe, it, expect } from 'bun:test'

describe('schemas', () => {
  it('deve ser um módulo válido', () => {
    const module = require('./schemas')
    expect(typeof module).toBe('object')
  })

  it('deve exportar funções ou constantes', () => {
    const module = require('./schemas')
    const exports = Object.keys(module)
    expect(exports.length > 0).toBe(true)
    
    // Verifica se pelo menos um export é uma função
    const hasFunction = Object.values(module).some(exp => typeof exp === 'function')
    expect(hasFunction).toBe(true)
  })

  it('deve ter exports nomeados válidos', () => {
    const module = require('./schemas')
    Object.entries(module).forEach(([key, value]) => {
      expect(key.length > 0).toBe(true)
      expect(['function', 'object', 'string', 'number'].includes(typeof value)).toBe(true)
    })
  })
})
