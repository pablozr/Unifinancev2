/**
 * @fileoverview Testes para utilitários de agregação
 * @description Testes unitários para funções de agregação e agrupamento de dados
 */

import { describe, it, expect } from 'bun:test'
import {
  groupTransactionsByMonth,
  groupTransactionsByCategory,
  aggregateTransactionsByType,
  filterTransactionsByType,
  calculateRunningBalance,
  generateEmptyPeriods
} from '../../app/dashboard/_data/utils/aggregationUtils'

describe('aggregationUtils', () => {
  describe('groupTransactionsByMonth', () => {
    const mockTransactions = [
      {
        date: new Date('2024-01-15'),
        amount: 100,
        type: 'credit'
      },
      {
        date: new Date('2024-01-20'),
        amount: 50,
        type: 'debit'
      },
      {
        date: new Date('2024-02-10'),
        amount: 200,
        type: 'credit'
      }
    ]

    it('deve agrupar transações por mês corretamente', () => {
      const result = groupTransactionsByMonth(mockTransactions)
      
      expect(result.size).toBe(2)
      
      const jan2024 = result.get('2024-0')
      expect(jan2024).toBeTruthy()
      expect(jan2024!.income).toBe(100)
      expect(jan2024!.expenses).toBe(50)
      expect(jan2024!.transactionCount).toBe(2)
      
      const feb2024 = result.get('2024-1')
      expect(feb2024).toBeTruthy()
      expect(feb2024!.income).toBe(200)
      expect(feb2024!.expenses).toBe(0)
      expect(feb2024!.transactionCount).toBe(1)
    })

    it('deve retornar mapa vazio para array vazio', () => {
      const result = groupTransactionsByMonth([])
      expect(result.size).toBe(0)
    })
  })

  describe('groupTransactionsByCategory', () => {
    const mockTransactions = [
      {
        category_id: 'cat-1',
        categories: { name: 'Alimentação', color: '#FF5733' },
        amount: 100
      },
      {
        category_id: 'cat-1',
        categories: { name: 'Alimentação', color: '#FF5733' },
        amount: 50
      },
      {
        category_id: 'cat-2',
        categories: { name: 'Transporte', color: '#33FF57' },
        amount: 75
      },
      {
        category_id: null,
        categories: null,
        amount: 25
      }
    ]

    it('deve agrupar transações por categoria corretamente', () => {
      const result = groupTransactionsByCategory(mockTransactions)
      
      expect(result.size).toBe(3)
      
      const alimentacao = result.get('cat-1')
      expect(alimentacao).toBeTruthy()
      expect(alimentacao!.name).toBe('Alimentação')
      expect(alimentacao!.total).toBe(150)
      expect(alimentacao!.count).toBe(2)
      expect(alimentacao!.color).toBe('#FF5733')
      
      const transporte = result.get('cat-2')
      expect(transporte).toBeTruthy()
      expect(transporte!.name).toBe('Transporte')
      expect(transporte!.total).toBe(75)
      expect(transporte!.count).toBe(1)
      
      const semCategoria = result.get('no-category')
      expect(semCategoria).toBeTruthy()
      expect(semCategoria!.name).toBe('Sem categoria')
      expect(semCategoria!.total).toBe(25)
      expect(semCategoria!.count).toBe(1)
      expect(semCategoria!.color).toBe('#6B7280')
    })

    it('deve retornar mapa vazio para array vazio', () => {
      const result = groupTransactionsByCategory([])
      expect(result.size).toBe(0)
    })
  })

  describe('aggregateTransactionsByType', () => {
    const mockTransactions = [
      { amount: 100, type: 'credit' },
      { amount: 50, type: 'debit' },
      { amount: 200, type: 'credit' },
      { amount: 75, type: 'debit' }
    ]

    it('deve agregar transações por tipo corretamente', () => {
      const result = aggregateTransactionsByType(mockTransactions)
      
      expect(result.income).toBe(300)
      expect(result.expenses).toBe(125)
      expect(result.total).toBe(425)
      expect(result.incomeCount).toBe(2)
      expect(result.expenseCount).toBe(2)
      expect(result.totalCount).toBe(4)
    })

    it('deve retornar zeros para array vazio', () => {
      const result = aggregateTransactionsByType([])
      
      expect(result.income).toBe(0)
      expect(result.expenses).toBe(0)
      expect(result.total).toBe(0)
      expect(result.incomeCount).toBe(0)
      expect(result.expenseCount).toBe(0)
      expect(result.totalCount).toBe(0)
    })
  })

  describe('filterTransactionsByType', () => {
    const mockTransactions = [
      { amount: 100, type: 'credit', id: '1' },
      { amount: 50, type: 'debit', id: '2' },
      { amount: 200, type: 'credit', id: '3' }
    ]

    it('deve filtrar transações de crédito corretamente', () => {
      const result = filterTransactionsByType(mockTransactions, 'credit')
      
      expect(result.transactions).toHaveLength(2)
      expect(result.total).toBe(300)
      expect(result.count).toBe(2)
      expect(result.average).toBe(150)
    })

    it('deve filtrar transações de débito corretamente', () => {
      const result = filterTransactionsByType(mockTransactions, 'debit')
      
      expect(result.transactions).toHaveLength(1)
      expect(result.total).toBe(50)
      expect(result.count).toBe(1)
      expect(result.average).toBe(50)
    })

    it('deve retornar resultado vazio quando não há transações do tipo', () => {
      const onlyCreditTransactions = [{ amount: 100, type: 'credit' }]
      const result = filterTransactionsByType(onlyCreditTransactions, 'debit')
      
      expect(result.transactions).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.count).toBe(0)
      expect(result.average).toBe(0)
    })
  })

  describe('calculateRunningBalance', () => {
    const mockTransactions = [
      { amount: 100, type: 'credit', id: '1' },
      { amount: 50, type: 'debit', id: '2' },
      { amount: 75, type: 'credit', id: '3' },
      { amount: 25, type: 'debit', id: '4' }
    ]

    it('deve calcular saldo acumulado corretamente', () => {
      const result = calculateRunningBalance(mockTransactions)
      
      expect(result).toHaveLength(4)
      expect(result[0].runningBalance).toBe(100) // +100
      expect(result[1].runningBalance).toBe(50)  // 100-50
      expect(result[2].runningBalance).toBe(125) // 50+75
      expect(result[3].runningBalance).toBe(100) // 125-25
    })

    it('deve usar saldo inicial quando fornecido', () => {
      const result = calculateRunningBalance(mockTransactions, 1000)
      
      expect(result[0].runningBalance).toBe(1100) // 1000+100
      expect(result[1].runningBalance).toBe(1050) // 1100-50
      expect(result[2].runningBalance).toBe(1125) // 1050+75
      expect(result[3].runningBalance).toBe(1100) // 1125-25
    })

    it('deve retornar array vazio para input vazio', () => {
      const result = calculateRunningBalance([])
      expect(result).toEqual([])
    })
  })

  describe('generateEmptyPeriods', () => {
    it('deve gerar períodos mensais vazios corretamente', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-03-31')
      
      const result = generateEmptyPeriods(startDate, endDate, 'month')
      
      expect(result).toHaveLength(3)
      expect(result[0].key).toBe('2024-0')
      expect(result[0].label).toContain('Jan')
      expect(result[1].key).toBe('2024-1')
      expect(result[2].key).toBe('2024-2')
    })

    it('deve gerar períodos diários vazios corretamente', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-03')
      
      const result = generateEmptyPeriods(startDate, endDate, 'day')
      
      expect(result).toHaveLength(3)
      expect(result[0].key).toBe('2024-01-01')
      expect(result[1].key).toBe('2024-01-02')
      expect(result[2].key).toBe('2024-01-03')
    })

    it('deve usar "month" como padrão quando intervalo não especificado', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-02-28')
      
      const result = generateEmptyPeriods(startDate, endDate)
      
      expect(result).toHaveLength(2)
      expect(result[0].key).toBe('2024-0')
      expect(result[1].key).toBe('2024-1')
    })
  })
}) 