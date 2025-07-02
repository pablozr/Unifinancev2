/**
 * Cria uma data para hoje com horas zeradas
 */
export const getToday = (): Date => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * Adiciona dias a uma data
 */
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date)
  newDate.setDate(date.getDate() + days)
  return newDate
}

/**
 * Subtrai dias de uma data
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days)
}

/**
 * Formata data para string ISO (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Calcula intervalos em dias entre datas consecutivas
 */
export const calculateIntervals = (dates: Date[]): number[] => {
  const intervals: number[] = []
  for (let i = 1; i < dates.length; i++) {
    const diffDays = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    intervals.push(diffDays)
  }
  return intervals
} 