/**
 * @fileoverview Utilitários para manipulação de datas
 * @description Funções auxiliares para cálculo de períodos e ranges de datas
 */

import type { PeriodFilter, DateRange } from '../types'

/**
 * @function getCurrentMonthRange
 * @description Retorna o range do mês atual
 * @returns {DateRange} Range de datas do mês atual
 */
export const getCurrentMonthRange = (): DateRange => {
  const now = new Date()
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }
}

/**
 * @function getPreviousMonthRange
 * @description Retorna o range do mês anterior
 * @returns {DateRange} Range de datas do mês anterior
 */
export const getPreviousMonthRange = (): DateRange => {
  const now = new Date()
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0)
  }
}

/**
 * @function getLast6MonthsRange
 * @description Retorna o range dos últimos 6 meses
 * @returns {DateRange} Range de datas dos últimos 6 meses
 */
export const getLast6MonthsRange = (): DateRange => {
  const now = new Date()
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 5, 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }
}

/**
 * @function getDateRangeFromFilter
 * @description Converte um filtro de período em range de datas
 * @param {PeriodFilter} filter - Filtro de período
 * @returns {DateRange | null} Range de datas ou null se não aplicável
 */
export const getDateRangeFromFilter = (filter: PeriodFilter): DateRange | null => {
  if (filter.type === 'monthly' && filter.year && filter.month !== undefined) {
    return {
      start: new Date(filter.year, filter.month, 1),
      end: new Date(filter.year, filter.month + 1, 0)
    }
  }
  
  if (filter.type === 'yearly' && filter.year) {
    return {
      start: new Date(filter.year, 0, 1),
      end: new Date(filter.year, 11, 31)
    }
  }
  
  if (filter.type === 'custom') {
    return getLast6MonthsRange()
  }
  
  return null
}

/**
 * @function getPreviousRangeFromFilter
 * @description Retorna o range anterior baseado no filtro
 * @param {PeriodFilter} filter - Filtro de período
 * @returns {DateRange | null} Range de datas anterior
 */
export const getPreviousRangeFromFilter = (filter: PeriodFilter): DateRange | null => {
  if (filter.type === 'monthly' && filter.year && filter.month !== undefined) {
    return {
      start: new Date(filter.year, filter.month - 1, 1),
      end: new Date(filter.year, filter.month, 0)
    }
  }
  
  if (filter.type === 'yearly' && filter.year) {
    return {
      start: new Date(filter.year - 1, 0, 1),
      end: new Date(filter.year - 1, 11, 31)
    }
  }
  
  if (filter.type === 'custom') {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 11, 1),
      end: new Date(now.getFullYear(), now.getMonth() - 5, 0)
    }
  }
  
  return null
} 