/**
 * Normaliza a descrição de uma transação para facilitar o agrupamento.
 * Converte para minúsculas, remove espaços extras e caracteres não alfanuméricos.
 * @param description A descrição original da transação.
 * @returns A descrição normalizada.
 */
export function normalizeDescription(description: string | null): string {
  if (!description) {
    return ''
  }
  
  // Exemplo: "Pagamento NETFLIX* Pgmto" -> "pagamento netflix pgmto"
  return description
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais, mantendo letras, números e espaços
    .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um único
} 