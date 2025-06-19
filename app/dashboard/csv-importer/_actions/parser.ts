import { RawBankStatement } from '../_types/types';

export async function parseCSV(file: File): Promise<RawBankStatement[]> {
  try {
    const text = await file.text();
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('Arquivo CSV deve ter pelo menos um cabeÃ§alho e uma linha de dados');
    }
    
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    
    
    const headerMap = {
      date: findHeaderIndex(headers, ['date', 'data', 'dt', 'fecha', 'datum']),
      description: findHeaderIndex(headers, ['description', 'descricao', 'desc', 'historico', 'memo', 'details', 'detalhes']),
      amount: findHeaderIndex(headers, ['amount', 'valor', 'value', 'val', 'quantia', 'money', 'price']),
      type: findHeaderIndex(headers, ['type', 'tipo', 'category', 'categoria', 'cat', 'class']),
      category: findHeaderIndex(headers, ['category', 'categoria', 'cat', 'class', 'group', 'grupo'])
    };
    
    
    if (headerMap.date === -1 && headerMap.description === -1 && headerMap.amount === -1) {
      throw new Error(`NÃ£o foi possÃ­vel identificar as colunas necessÃ¡rias. CabeÃ§alhos encontrados: ${headers.join(', ')}`);
    }
    
    const results: RawBankStatement[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {continue;}
      
      try {
        const values = parseCSVLine(line);
        
        const rawDate = headerMap.date >= 0 ? values[headerMap.date]?.trim() : `${new Date().getFullYear()}-01-01`;
        const description = headerMap.description >= 0 ? values[headerMap.description]?.trim() : `TransaÃ§Ã£o ${i}`;
        const rawAmount = headerMap.amount >= 0 ? values[headerMap.amount]?.trim() : '0';
        const typeOrCategory = headerMap.type >= 0 ? values[headerMap.type]?.trim() : '';
        const category = headerMap.category >= 0 ? values[headerMap.category]?.trim() : undefined;
        
        if (!rawAmount || rawAmount === '0' || rawAmount === '') {
          continue;
        }
        
        let amount = parseAmount(rawAmount);
        
        let processedType: 'credit' | 'debit';
        
        if (amount < 0) {
          processedType = 'debit';
          amount = Math.abs(amount);
        }
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
            processedType = 'credit';
          }
        }
        else {
          processedType = 'credit';
        }
        
        results.push({
          date: rawDate,
          description: description || `TransaÃ§Ã£o ${i}`,
          amount,
          type: processedType,
          category: category || typeOrCategory || undefined
        });
        
      } catch (error) {
        continue;
      }
    }
    
    if (results.length === 0) {
      throw new Error('Nenhuma linha vÃ¡lida encontrada no arquivo CSV');
    }
    
    return results;
    
  } catch (error) {
    throw new Error(`Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Pular a prÃ³xima aspa
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  
  return result;
}

function findHeaderIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => {
      const headerLower = header.toLowerCase().trim();
      const nameLower = name.toLowerCase();
      return headerLower.includes(nameLower) || nameLower.includes(headerLower);
    });
    if (index >= 0) {return index;}
  }
  return -1;
}

function parseAmount(value: string): number {
  if (!value || value.trim() === '') {
    throw new Error('Valor vazio');
  }
  
  let cleaned = value.replace(/[R$â‚¬Â£Â¥â‚¹â‚½\s]/g, '');
  
  cleaned = cleaned.replace(/[^\d.,+\-]/g, '');
  
  if (!cleaned) {
    throw new Error('Nenhum nÃºmero encontrado');
  }
  
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error(`Valor invÃ¡lido: ${value}`);
  }
  
  return parsed;
}
