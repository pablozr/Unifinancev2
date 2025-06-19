/**
 * @fileoverview Testes para utilitários de cálculo financeiro
 */

import { describe, it, expect } from 'bun:test'
import {
  calculatePercentageChange,
  sumTransactionsByType,
  calculateTotalBalance,
  transformTransaction,
  calculateCategoryPercentages,
  groupTransactionsByCategory,
  isRefundTransaction
} from '@/app/dashboard/_data/utils/calculationUtils'

describe('calculatePercentageChange', () => {
  it('deve calcular mudança percentual positiva', () => {
    expect(calculatePercentageChange(150, 100)).toBe(50)
  })

  it('deve calcular mudança percentual negativa', () => {
    expect(calculatePercentageChange(75, 100)).toBe(-25)
  })

  it('deve retornar 100 quando valor anterior é 0 e atual é positivo', () => {
    expect(calculatePercentageChange(50, 0)).toBe(100)
  })

  it('deve retornar 0 quando ambos os valores são 0', () => {
    expect(calculatePercentageChange(0, 0)).toBe(0)
  })
})

describe('sumTransactionsByType', () => {
  const transactions = [
    { type: 'credit', amount: 1000, description: 'Salário' },
    { type: 'debit', amount: 500, description: 'Compras' },
    { type: 'credit', amount: 200, description: 'Freelance' },
    { type: 'credit', amount: 100, description: 'Estorno de compra' },
    { type: 'debit', amount: 300, description: 'Aluguel' }
  ]

  it('deve somar transações de crédito excluindo estornos', () => {
    const result = sumTransactionsByType(transactions, 'credit')
    expect(result).toBe(1200) // 1000 + 200, excluindo estorno
  })

  it('deve somar todas as transações de débito', () => {
    const result = sumTransactionsByType(transactions, 'debit')
    expect(result).toBe(800) // 500 + 300
  })

  it('deve retornar 0 para array vazio', () => {
    expect(sumTransactionsByType([], 'credit')).toBe(0)
  })
})

describe('calculateTotalBalance', () => {
  it('deve calcular saldo total corretamente', () => {
    const transactions = [
      { type: 'credit', amount: 1000, description: 'Salário' },
      { type: 'debit', amount: 500, description: 'Compras' },
      { type: 'credit', amount: 200, description: 'Freelance' }
    ]

    const result = calculateTotalBalance(transactions)
    expect(result).toBe(700) // 1000 + 200 - 500
  })

  it('deve excluir estornos do cálculo do saldo', () => {
    const transactions = [
      { type: 'credit', amount: 1000, description: 'Salário' },
      { type: 'credit', amount: 100, description: 'Estorno de compra' },
      { type: 'debit', amount: 500, description: 'Compras' }
    ]

    const result = calculateTotalBalance(transactions)
    expect(result).toBe(500) // 1000 - 500, excluindo estorno
  })
})

describe('isRefundTransaction', () => {
  it('deve identificar estorno', () => {
    const transaction = { description: 'Estorno de compra' }
    expect(isRefundTransaction(transaction)).toBe(true)
  })

  it('deve identificar refund', () => {
    const transaction = { description: 'Refund payment' }
    expect(isRefundTransaction(transaction)).toBe(true)
  })

  it('deve retornar false para transação normal', () => {
    const transaction = { description: 'Compra no supermercado' }
    expect(isRefundTransaction(transaction)).toBe(false)
  })

  it('deve funcionar com descrição undefined', () => {
    const transaction = { description: undefined }
    expect(isRefundTransaction(transaction)).toBe(false)
  })
})

describe('transformTransaction', () => {
  it('deve transformar transação do Supabase para formato frontend', () => {
    const supabaseTransaction = {
      id: '123',
      description: 'Compra teste',
      amount: 100,
      type: 'debit',
      date: '2024-01-01',
      categories: {
        name: 'Alimentação',
        color: '#FF0000'
      }
    }

    const result = transformTransaction(supabaseTransaction)

    expect(result).toEqual({
      id: '123',
      description: 'Compra teste',
      amount: 100,
      type: 'expense',
      date: '2024-01-01',
      categoryName: 'Alimentação',
      categoryColor: '#FF0000'
    })
  })

  it('deve transformar transação de crédito para income', () => {
    const supabaseTransaction = {
      id: '456',
      description: 'Salário',
      amount: 3000,
      type: 'credit',
      date: '2024-01-01',
      categories: null
    }

    const result = transformTransaction(supabaseTransaction)

    expect(result).toEqual({
      id: '456',
      description: 'Salário',
      amount: 3000,
      type: 'income',
      date: '2024-01-01',
      categoryName: undefined,
      categoryColor: undefined
    })
  })
})

describe('groupTransactionsByCategory', () => {
  it('deve agrupar transações por categoria', () => {
    const transactions = [
      {
        amount: 100,
        categories: { name: 'Alimentação', color: '#FF0000' }
      },
      {
        amount: 200,
        categories: { name: 'Alimentação', color: '#FF0000' }
      },
      {
        amount: 150,
        categories: { name: 'Transporte', color: '#00FF00' }
      }
    ]

    const result = groupTransactionsByCategory(transactions)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      categoryName: 'Alimentação',
      totalAmount: 300,
      transactionCount: 2,
      color: '#FF0000',
      percentage: 66.67 // 300/450 * 100
    })
  })

  it('deve retornar array vazio para transações vazias', () => {
    const result = groupTransactionsByCategory([])
    expect(result).toEqual([])
  })

  it('deve lidar com transações sem categoria', () => {
    const transactions = [
      {
        amount: 100,
        categories: null
      }
    ]

    const result = groupTransactionsByCategory(transactions)

    expect(result).toHaveLength(1)
    expect(result[0].categoryName).toBe('Sem categoria')
    expect(result[0].color).toBe('#6B7280')
  })
}) 