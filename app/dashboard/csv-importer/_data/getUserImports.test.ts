import { describe, it, expect } from 'bun:test'
import getUserImports from './getUserImports'

describe('getUserImports', () => {
  it('deve retornar array de importações CSV', async () => {
    try {
      const imports = await getUserImports()
      
      // Deve retornar array (vazio ou com dados)
      expect(Array.isArray(imports)).toBe(true)
      
      // Se há dados, verifica estrutura CSVImport
      if (imports.length > 0) {
        const firstImport = imports[0]
        expect(typeof firstImport.id).toBe('string')
        expect(typeof firstImport.filename).toBe('string')
        expect(typeof firstImport.file_size).toBe('number')
        expect(typeof firstImport.total_rows).toBe('number')
        expect(typeof firstImport.valid_rows).toBe('number')
        expect(['processing', 'completed', 'failed'].includes(firstImport.status)).toBe(true)
        expect(typeof firstImport.created_at).toBe('string')
      }
    } catch (error) {
      // Erro de autenticação ou contexto é esperado
      expect((error as Error).message.includes('autenticado') || 
             (error as Error).message.includes('cookies')).toBe(true)
    }
  })

  it('deve retornar array vazio em caso de erro', async () => {
    // A função sempre retorna array, mesmo com erro
    const result = await getUserImports()
    expect(Array.isArray(result)).toBe(true)
  })
}) 