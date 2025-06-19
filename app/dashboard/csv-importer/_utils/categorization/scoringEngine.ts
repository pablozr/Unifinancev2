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
    
    if (normalizedDesc.includes(normalizedKeyword)) {
      totalScore += 15
      matches++
      continue
    }
    
    for (const kwWord of kwWords) {
      if (kwWord.length >= 3) {
        for (const word of words) {
          if (word.length >= 3) {
            if (word === kwWord) {
              totalScore += 10
              matches++
            }
            else if (kwWord.length >= 4 && (word.includes(kwWord) || kwWord.includes(word))) {
              totalScore += 6
              matches++
            }
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
  
  if (matches === 0) return 0
  
  const density = matches / Math.max(words.length, 1)
  const finalScore = totalScore * Math.min(density * 2, 1) // Bonus para alta densidade
  
  return Math.min(finalScore, 100) // MÃ¡ximo 100
} 
