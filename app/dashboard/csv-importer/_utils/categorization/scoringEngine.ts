import normalizeText from './textNormalizer'

/**
 * Calcula score de match entre texto e palavras-chave
 */
export default function calculateMatchScore(description: string, keywords: string[]): number {
  const normalizedDesc = normalizeText(description)
  const words = normalizedDesc.split(' ').filter(w => w.length >= 2)
  
  let totalScore = 0
  let matches = 0
  
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword)
    const kwWords = normalizedKeyword.split(' ').filter(w => w.length >= 2)
    
    // 1. Match exato da palavra-chave completa
    if (normalizedDesc.includes(normalizedKeyword)) {
      totalScore += 15
      matches++
      continue
    }
    
    // 2. Match de palavras individuais
    for (const kwWord of kwWords) {
      if (kwWord.length >= 3) {
        for (const word of words) {
          if (word.length >= 3) {
            // Match exato de palavra
            if (word === kwWord) {
              totalScore += 10
              matches++
            }
            // Match parcial de palavra (uma contém a outra com pelo menos 4 chars)
            else if (kwWord.length >= 4 && (word.includes(kwWord) || kwWord.includes(word))) {
              totalScore += 6
              matches++
            }
            // Match por similaridade (mesmo início)
            else if (kwWord.length >= 4 && word.length >= 4 && 
                     word.substring(0, 3) === kwWord.substring(0, 3)) {
              totalScore += 4
              matches++
            }
          }
        }
      }
    }
  }
  
  // Ajustar score baseado na densidade de matches
  if (matches === 0) return 0
  
  const density = matches / Math.max(words.length, 1)
  const finalScore = totalScore * Math.min(density * 2, 1) // Bonus para alta densidade
  
  return Math.min(finalScore, 100) // Máximo 100
} 