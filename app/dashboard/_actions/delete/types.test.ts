const { describe, it, expect } = require('bun:test')

describe('types', () => {
  it('deve ser um módulo válido', () => {
    const module = require('./types')
    expect(typeof module).toBe('object')
  })

  it('deve exportar interfaces e tipos', () => {
    // Arquivo só com interfaces TypeScript - sem exports de runtime
    const fs = require('fs')
    const content = fs.readFileSync('./app/dashboard/_actions/delete/types.ts', 'utf-8')
    expect(content.includes('interface') || content.includes('type')).toBe(true)
    
    // Verifica se pelo menos um export é uma função
    const hasFunction = Object.values(module).some(exp => typeof exp === 'function')
    expect(hasFunction).toBe(true)
  })

  it('deve ter exports nomeados válidos', () => {
    const module = require('./types')
    Object.entries(module).forEach(([key, value]) => {
      expect(key.length > 0).toBe(true)
      expect(['function', 'object', 'string', 'number'].includes(typeof value)).toBe(true)
    })
  })
})
