/**
 * @fileoverview Utilitários centralizados para manipulação de datas
 * @description Sistema unificado para parsing, validação e formatação de datas no formato brasileiro
 */

/**
 * Valida se uma string representa uma data válida
 * Suporta vários formatos comuns de data brasileira
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false
  }

  // Remove espaços em branco
  const cleanDate = dateString.trim()
  
  // Regex para formatos comuns de data brasileira
  const dateFormats = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,     // DD/MM/YYYY ou D/M/YYYY
    /^\d{1,2}\/\d{1,2}\/\d{2}$/,     // DD/MM/YY ou D/M/YY
    /^\d{1,2}-\d{1,2}-\d{4}$/,       // DD-MM-YYYY ou D-M-YYYY
    /^\d{1,2}-\d{1,2}-\d{2}$/,       // DD-MM-YY ou D-M-YY
    /^\d{1,2}\.\d{1,2}\.\d{4}$/,     // DD.MM.YYYY ou D.M.YYYY
    /^\d{4}-\d{1,2}-\d{1,2}$/,       // YYYY-MM-DD (ISO format - apenas quando explícito)
  ]

  // Verifica se o formato está correto
  const hasValidFormat = dateFormats.some(format => format.test(cleanDate))
  if (!hasValidFormat) {
    return false
  }

  // Tenta criar um objeto Date usando parsing brasileiro
  const date = parseDateBR(cleanDate)
  if (!date) {
    return false
  }

  // Verifica se a data não é muito antiga ou muito futura
  const currentYear = new Date().getFullYear()
  const dateYear = date.getFullYear()
  
  // Aceita datas entre 1900 e 10 anos no futuro
  if (dateYear < 1900 || dateYear > currentYear + 10) {
    return false
  }

  return true
}

/**
 * Converte string de data para objeto Date usando formato brasileiro
 * SEMPRE assume formato brasileiro DD/MM/YYYY exceto quando explicitamente YYYY-MM-DD
 */
export function parseDateBR(dateString: string): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }

  const cleaned = dateString.trim()
  
  // Tentar formato ISO explícito YYYY-MM-DD primeiro (apenas quando tem 4 dígitos no início)
  const isoFormat = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoFormat) {
    const year = parseInt(isoFormat[1])
    const month = parseInt(isoFormat[2]) - 1 // Date usa 0-11 para meses
    const day = parseInt(isoFormat[3])
    
    // Validar valores
    if (month < 0 || month > 11 || day < 1 || day > 31) {
      return null
    }
    
    const date = new Date(year, month, day)
    // Verificar se a data é válida (não houve overflow)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null
    }
    
    return date
  }

  // Formatos brasileiros (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY)
  const separators = ['/', '-', '.']
  
  for (const separator of separators) {
    if (cleaned.includes(separator)) {
      const parts = cleaned.split(separator)
      
      if (parts.length === 3) {
        const day = parseInt(parts[0])
        const month = parseInt(parts[1])
        let year = parseInt(parts[2])
        
        // Ajustar ano de 2 dígitos (assumir 20XX para anos < 50, 19XX para >= 50)
        if (year < 100) {
          year = year < 50 ? 2000 + year : 1900 + year
        }
        
        // Validar valores básicos
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
          continue
        }
        
        // Criar data (mês em JavaScript é 0-11)
        const date = new Date(year, month - 1, day)
        
        // Verificar se a data é válida (não houve overflow)
        if (date.getFullYear() !== year || date.getMonth() !== (month - 1) || date.getDate() !== day) {
          continue
        }
        
        return date
      }
    }
  }
  
  console.warn(`Formato de data não reconhecido: ${dateString}`)
  return null
}

/**
 * Converte string de data para objeto Date (alias para parseDateBR)
 * Mantido para compatibilidade com código existente
 */
export function parseDate(dateString: string): Date | null {
  return parseDateBR(dateString)
}

/**
 * Formata data para string no formato brasileiro DD/MM/YYYY
 */
export function formatDateBR(date: Date | string): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Formata data usando Intl.DateTimeFormat para garantir formatação brasileira
 */
export function formatDateIntl(date: Date | string): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  }).format(dateObj)
}

/**
 * Formata data relativa em português brasileiro
 */
export function formatRelativeDateBR(date: Date | string): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }
  
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Hoje'
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `${diffInDays} dias atrás`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`
  
  return formatDateIntl(dateObj)
}

/**
 * Converte Date para string no formato adequado para banco de dados (YYYY-MM-DD)
 */
export function formatDateForDB(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida para salvamento no banco de dados')
  }
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Testa se uma string é uma data no formato brasileiro válida
 */
export function isValidBrazilianDate(dateString: string): boolean {
  const date = parseDateBR(dateString)
  return date !== null
}