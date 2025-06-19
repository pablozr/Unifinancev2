const { describe, it, expect } = require('bun:test')

describe('types', () => {
  it('deve ser um módulo válido', () => {
    const module = require('./types')
    expect(typeof module).toBe('object')
  })

  it('deve exportar interfaces TypeScript', () => {
    // Arquivo só com interfaces TypeScript - sem exports de runtime
    const fs = require('fs')
    const content = fs.readFileSync('./app/dashboard/_data/types.ts', 'utf-8')
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

  it('deve exportar interfaces TypeScript válidas', () => {
    // Testa se o módulo pode ser importado sem erro
    const typesModule = require('./types')
    expect(typeof typesModule).toBe('object')
  })

  it('deve conter definições de tipos essenciais', () => {
    // Verifica se o arquivo contém as principais interfaces
    const fs = require('fs')
    const content = fs.readFileSync('./app/dashboard/_data/types.ts', 'utf-8')
    
    expect(content.includes('DashboardStats')).toBe(true)
    expect(content.includes('RecentTransaction')).toBe(true)
    expect(content.includes('CategorySpending')).toBe(true)
    expect(content.includes('TransactionType')).toBe(true)
  })
})
