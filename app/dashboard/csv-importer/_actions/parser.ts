import { RawBankStatement } from '../_types/types';

export async function parseCSV(file: File): Promise<RawBankStatement[]> {
  try {
    // Converter File para texto
    const text = await file.text();
    
    // Dividir em linhas e remover linhas vazias
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
    }
    
    // Primeira linha é o cabeçalho
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    
    console.log('Cabeçalhos encontrados:', headers);
    
    // Mapear índices dos cabeçalhos (mais flexível)
    const headerMap = {
      date: findHeaderIndex(headers, ['date', 'data', 'dt', 'fecha', 'datum']),
      description: findHeaderIndex(headers, ['description', 'descricao', 'desc', 'historico', 'memo', 'details', 'detalhes']),
      amount: findHeaderIndex(headers, ['amount', 'valor', 'value', 'val', 'quantia', 'money', 'price']),
      type: findHeaderIndex(headers, ['type', 'tipo', 'category', 'categoria', 'cat', 'class']),
      category: findHeaderIndex(headers, ['category', 'categoria', 'cat', 'class', 'group', 'grupo'])
    };
    
    console.log('Mapeamento de cabeçalhos:', headerMap);
    
    // Verificar se pelo menos temos data, descrição e valor
    if (headerMap.date === -1 && headerMap.description === -1 && headerMap.amount === -1) {
      throw new Error(`Não foi possível identificar as colunas necessárias. Cabeçalhos encontrados: ${headers.join(', ')}`);
    }
    
    // Processar linhas de dados
    const results: RawBankStatement[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const values = parseCSVLine(line);
        
        // Extrair valores usando o mapeamento (com fallbacks)
        const rawDate = headerMap.date >= 0 ? values[headerMap.date]?.trim() : `${new Date().getFullYear()}-01-01`;
        const description = headerMap.description >= 0 ? values[headerMap.description]?.trim() : `Transação ${i}`;
        const rawAmount = headerMap.amount >= 0 ? values[headerMap.amount]?.trim() : '0';
        const typeOrCategory = headerMap.type >= 0 ? values[headerMap.type]?.trim() : '';
        const category = headerMap.category >= 0 ? values[headerMap.category]?.trim() : undefined;
        
        // Pular linhas sem dados essenciais
        if (!rawAmount || rawAmount === '0' || rawAmount === '') {
          console.warn(`Linha ${i + 1}: Valor não encontrado ou zero`);
          continue;
        }
        
        // Processar valor
        let amount = parseAmount(rawAmount);
        
        // Determinar tipo de transação (mais inteligente)
        let processedType: 'credit' | 'debit';
        
        // 1. Verificar se o valor é negativo
        if (amount < 0) {
          processedType = 'debit';
          amount = Math.abs(amount);
        }
        // 2. Verificar coluna tipo/categoria
        else if (typeOrCategory) {
          const typeText = typeOrCategory.toLowerCase();
          if (typeText.includes('credit') || typeText.includes('credito') || 
              typeText.includes('entrada') || typeText.includes('receita') ||
              typeText.includes('income') || typeText.includes('deposit') ||
              typeText.includes('salary') || typeText.includes('salario')) {
            processedType = 'credit';
          } else if (typeText.includes('debit') || typeText.includes('debito') || 
                     typeText.includes('saida') || typeText.includes('despesa') ||
                     typeText.includes('expense') || typeText.includes('withdrawal') ||
                     typeText.includes('payment') || typeText.includes('pagamento')) {
            processedType = 'debit';
          } else {
            // Se não conseguir determinar, assumir crédito para valores positivos
            processedType = 'credit';
          }
        }
        // 3. Fallback: valores positivos = crédito
        else {
          processedType = 'credit';
        }
        
        results.push({
          date: rawDate,
          description: description || `Transação ${i}`,
          amount,
          type: processedType,
          category: category || typeOrCategory || undefined
        });
        
      } catch (error) {
        console.warn(`Erro na linha ${i + 1}:`, error);
        continue;
      }
    }
    
    if (results.length === 0) {
      throw new Error('Nenhuma linha válida encontrada no arquivo CSV');
    }
    
    console.log(`Processadas ${results.length} transações com sucesso`);
    return results;
    
  } catch (error) {
    throw new Error(`Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Função para fazer parse de uma linha CSV (lida com aspas e vírgulas)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Aspas duplas escapadas
        current += '"';
        i++; // Pular a próxima aspa
      } else {
        // Alternar estado das aspas
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      // Vírgula ou ponto-e-vírgula fora das aspas = separador
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Adicionar último campo
  result.push(current.trim());
  
  return result;
}

// Função para encontrar índice do cabeçalho (mais flexível)
function findHeaderIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => {
      const headerLower = header.toLowerCase().trim();
      const nameLower = name.toLowerCase();
      return headerLower.includes(nameLower) || nameLower.includes(headerLower);
    });
    if (index >= 0) return index;
  }
  return -1;
}

// Função para processar valores monetários (mais robusta)
function parseAmount(value: string): number {
  if (!value || value.trim() === '') {
    throw new Error('Valor vazio');
  }
  
  // Remover símbolos de moeda e espaços
  let cleaned = value.replace(/[R$€£¥₹₽\s]/g, '');
  
  // Remover caracteres não numéricos (exceto . , + -)
  cleaned = cleaned.replace(/[^\d.,+\-]/g, '');
  
  if (!cleaned) {
    throw new Error('Nenhum número encontrado');
  }
  
  // Lidar com formatos brasileiros (1.234,56) vs americanos (1,234.56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Se tem ambos, assumir formato brasileiro se vírgula vem depois
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // Formato brasileiro: 1.234,56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato americano: 1,234.56
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Só vírgula - pode ser decimal brasileiro ou separador de milhares
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Provavelmente decimal brasileiro
      cleaned = cleaned.replace(',', '.');
    } else {
      // Provavelmente separador de milhares
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error(`Valor inválido: ${value}`);
  }
  
  return parsed;
}