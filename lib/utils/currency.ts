/**
 * @fileoverview Utilitários para formatação de valores monetários e percentuais
 * @description Funções centralizadas para evitar duplicação de código
 */

/**
 * Formata um valor numérico em formato de moeda brasileira (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada em formato de moeda (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Formata um valor numérico em formato de porcentagem
 * @param value - Valor numérico a ser formatado (ex: 15.5 para 15.5%)
 * @returns String formatada em formato de porcentagem (ex: "+15.5%" ou "-10.2%")
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Formata um valor numérico em formato de porcentagem simples (sem sinal)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada em formato de porcentagem (ex: "15.5%")
 */
export function formatPercentageSimple(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Formata um valor numérico de forma compacta para grandes números
 * @param value - Valor numérico a ser formatado
 * @returns String formatada de forma compacta (ex: "1,2K", "1,5M")
 */
export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value)
}

/**
 * Formata um valor numérico sem símbolo de moeda
 * @param value - Valor numérico a ser formatado
 * @returns String formatada apenas com separadores (ex: "1.234,56")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
} 