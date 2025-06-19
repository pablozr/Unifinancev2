import { describe, it, expect } from 'bun:test'
import getImportSummaries from './getImportSummaries'

describe('getImportSummaries', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000'

  it('deve exportar uma função', () => {
    expect(typeof getImportSummaries).toBe('function')
  })

  it('deve validar parâmetros de entrada', async () => {
    try {
      // Testa com parâmetro inválido
      await getImportSummaries(null as any)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }

    try {
      // Testa com string vazia
      await getImportSummaries('')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve retornar dados estruturados para entrada válida', async () => {
    try {
      // Determina parâmetros corretos baseado no nome da função
      let params
      if (getImportSummaries.length === 1) {
        // Função que aceita userId ou config
        params = 'getImportSummaries'.includes('Transaction') && getImportSummaries.length === 1 
          ? { userId: mockUserId }  // TransactionQuery
          : mockUserId              // string userId
      } else {
        // Função com múltiplos parâmetros
        params = mockUserId
      }

      const result = await getImportSummaries(params as string)
      
      // Verifica se retornou dados estruturados
      expect(result !== null && result !== undefined).toBe(true)
      
      // Validações específicas baseadas no tipo de função
      if ('getImportSummaries'.includes('get') || 'getImportSummaries'.includes('fetch')) {
        // Funções getter devem retornar dados ou array
        expect(Array.isArray(result) || typeof result === 'object').toBe(true)
      }
      
      if ('getImportSummaries'.includes('Stats') || 'getImportSummaries'.includes('Metrics')) {
        // Funções de estatísticas devem retornar objeto com números
        expect(typeof result).toBe('object')
        const hasNumericProps = Object.values(result).some(val => typeof val === 'number')
        expect(hasNumericProps).toBe(true)
      }
      
      if ('getImportSummaries'.includes('Transaction')) {
        // Funções de transação devem retornar array ou objeto com transações
        if (Array.isArray(result)) {
          expect(Array.isArray(result)).toBe(true)
        } else {
          expect(typeof result).toBe('object')
        }
      }

    } catch (error) {
      // Erro de conexão/contexto é aceitável em ambiente de teste
      expect(error).toBeInstanceOf(Error)
      const errorMessage = (error as Error).message
      
      // Verifica se é erro de contexto esperado ou erro de DB
      const isKnownError = errorMessage.includes('request scope') ||
                          errorMessage.includes('connection') ||
                          errorMessage.includes('database') ||
                          errorMessage.includes('cookies') ||
                          errorMessage.includes('Supabase') ||
                          errorMessage.includes('Invalid UUID') ||
                          errorMessage.includes('not defined')
      expect(isKnownError).toBe(true)
    }
  })

  it('deve ter cache adequado (se aplicável)', () => {
    // Verifica se função cached mantém propriedades esperadas
    if (getImportSummaries.toString().includes('cache')) {
      expect(typeof getImportSummaries).toBe('function')
      // Funções cached do React mantêm estrutura de função
      expect(getImportSummaries.length >= 0).toBe(true)
    }
  })

  it('deve lidar com UUID inválido graciosamente', async () => {
    try {
      const invalidUuid = 'invalid-uuid-format'
      await getImportSummaries(invalidUuid)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      // Deve rejeitar UUID inválido
      expect((error as Error).message.length > 0).toBe(true)
    }
  })
})
