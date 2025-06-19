/**
 * @fileoverview Testes para dateUtils
 * @description Testes unitários das funções de manipulação de datas
 */

import { describe, it, expect } from 'bun:test'
import {
  getCurrentMonthRange,
  getPreviousMonthRange,
  getLast6MonthsRange,
  getDateRangeFromFilter,
  getPreviousRangeFromFilter
} from '../../app/dashboard/_data/utils/dateUtils'

describe('dateUtils', () => {
  describe('getCurrentMonthRange', () => {
    it('deve retornar o range do mês atual', () => {
      const result = getCurrentMonthRange()
      const now = new Date()
      const expectedStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const expectedEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      expect(result.start.getTime()).toBe(expectedStart.getTime())
      expect(result.end.getTime()).toBe(expectedEnd.getTime())
    })
  })

  describe('getPreviousMonthRange', () => {
    it('deve retornar o range do mês anterior', () => {
      const result = getPreviousMonthRange()
      const now = new Date()
      const expectedStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const expectedEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      
      expect(result.start.getTime()).toBe(expectedStart.getTime())
      expect(result.end.getTime()).toBe(expectedEnd.getTime())
    })
  })

  describe('getLast6MonthsRange', () => {
    it('deve retornar o range dos últimos 6 meses', () => {
      const result = getLast6MonthsRange()
      const now = new Date()
      const expectedStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const expectedEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      expect(result.start.getTime()).toBe(expectedStart.getTime())
      expect(result.end.getTime()).toBe(expectedEnd.getTime())
    })
  })

  describe('getDateRangeFromFilter', () => {
    it('deve converter filtro mensal para range de datas', () => {
      const filter = { type: 'monthly' as const, year: 2024, month: 0 }
      const result = getDateRangeFromFilter(filter)
      
      expect(result).not.toBeNull()
      expect(result!.start).toEqual(new Date(2024, 0, 1))
      expect(result!.end).toEqual(new Date(2024, 1, 0))
    })

    it('deve converter filtro anual para range de datas', () => {
      const filter = { type: 'yearly' as const, year: 2024 }
      const result = getDateRangeFromFilter(filter)
      
      expect(result).not.toBeNull()
      expect(result!.start).toEqual(new Date(2024, 0, 1))
      expect(result!.end).toEqual(new Date(2024, 11, 31))
    })

    it('deve converter filtro custom para últimos 6 meses', () => {
      const filter = { type: 'custom' as const }
      const result = getDateRangeFromFilter(filter)
      
      expect(result).not.toBeNull()
      expect(result!.start).toBeInstanceOf(Date)
      expect(result!.end).toBeInstanceOf(Date)
    })

    it('deve retornar null para filtro inválido', () => {
      const filter = { type: 'monthly' as const } // Sem year/month
      const result = getDateRangeFromFilter(filter)
      
      expect(result).toBeNull()
    })
  })

  describe('getPreviousRangeFromFilter', () => {
    it('deve retornar range anterior para filtro mensal', () => {
      const filter = { type: 'monthly' as const, year: 2024, month: 1 }
      const result = getPreviousRangeFromFilter(filter)
      
      expect(result).not.toBeNull()
      expect(result!.start).toEqual(new Date(2024, 0, 1))
      expect(result!.end).toEqual(new Date(2024, 1, 0))
    })

    it('deve retornar range anterior para filtro anual', () => {
      const filter = { type: 'yearly' as const, year: 2024 }
      const result = getPreviousRangeFromFilter(filter)
      
      expect(result).not.toBeNull()
      expect(result!.start).toEqual(new Date(2023, 0, 1))
      expect(result!.end).toEqual(new Date(2023, 11, 31))
    })

    it('deve retornar range anterior para filtro custom', () => {
      const filter = { type: 'custom' as const }
      const result = getPreviousRangeFromFilter(filter)
      
      expect(result).not.toBeNull()
      expect(result!.start).toBeInstanceOf(Date)
      expect(result!.end).toBeInstanceOf(Date)
    })
  })
}) 