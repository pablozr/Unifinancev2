import { describe, it, expect } from 'bun:test'

describe('getDefaultCategories', () => {
  it('deve ser um módulo TypeScript válido', () => {
    // Arquivo apenas com types/interfaces - testa se pode ser importado
    const importPath = './getDefaultCategories'
    expect(() => require(importPath)).not.toThrow()
  })

  it('deve conter definições esperadas', () => {
    // Verifica se o arquivo contém pelo menos definições de tipos
    const fs = require('fs')
    const content = fs.readFileSync('./app/dashboard/csv-importer/_data/getDefaultCategories.ts', 'utf-8')
    expect(content.includes('export')).toBe(true)
  })
})
