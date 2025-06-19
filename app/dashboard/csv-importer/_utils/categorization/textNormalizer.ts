/**
 * Normaliza texto para comparação
 */
export default function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[*]/g, ' ') // Remove asteriscos
    .replace(/[^\w\s]/g, ' ') // Remove pontuação mas mantém underscore
    .replace(/\d{2,}/g, ' ') // Remove números longos (IDs, etc)
    .replace(/\s+/g, ' ') // Múltiplos espaços vira um
    .trim()
} 