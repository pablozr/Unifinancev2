# Estrutura Modular do CSV Importer

Este documento explica a nova arquitetura modular do sistema de importação de CSV, que foi refatorada para ser mais maintível e escalável.

## Estrutura de Diretórios

```
csv-importer/
├── _actions/           # Ações do servidor
│   ├── uploadAndProcess.ts  # Orquestrador principal
│   ├── parser.ts           # Parse de arquivos CSV
│   ├── transformer.ts      # Transformação de dados
│   └── validator.ts        # Validação de dados
├── _data/              # Operações de banco de dados
│   ├── createImportRecord.ts   # Criação de registros de import
│   ├── saveTransactions.ts    # Salvamento de transações
│   └── getDefaultCategories.ts # Categorias padrão
├── _utils/             # Utilitários e helpers
│   ├── fileValidation.ts      # Validação de arquivos
│   ├── duplicateHandler.ts    # Gestão de duplicados
│   ├── csvProcessor.ts        # Processamento de CSV
│   ├── categorizationProcessor.ts # Categorização automática
│   ├── statsCalculator.ts     # Cálculo de estatísticas
│   └── categorizationRefactored.ts # Sistema de categorização refatorado
└── _types/             # Definições de tipos
    └── types.ts        # Tipos compartilhados
```

## Fluxo de Processamento

### 1. `uploadAndProcess.ts` (Orquestrador Principal)
- **Responsabilidade**: Coordenar todo o processo de upload
- **Módulos utilizados**: Todos os módulos abaixo
- **Fluxo**:
  1. Verificar autenticação
  2. Validar arquivo
  3. Verificar duplicados
  4. Processar CSV
  5. Aplicar categorização
  6. Criar registro de import
  7. Salvar transações
  8. Calcular estatísticas

### 2. Módulos de Validação

#### `fileValidation.ts`
```typescript
interface FileValidationResult {
  isValid: boolean
  error?: string
  fileBuffer?: ArrayBuffer
  fileHash?: string
}
```
- Valida tipo, tamanho e calcula hash do arquivo

#### `duplicateHandler.ts`
```typescript
interface DuplicateCheckResult {
  isDuplicate: boolean
  error?: string
  existingImports?: any[]
}
```
- Verifica se o arquivo já foi importado anteriormente

### 3. Módulos de Processamento

#### `csvProcessor.ts`
```typescript
interface CSVProcessResult {
  success: boolean
  processedTransactions?: ProcessedTransaction[]
  totalRows?: number
  validRows?: number
}
```
- Faz parse e validação inicial do CSV
- Converte para `ProcessedTransaction[]`

#### `categorizationProcessor.ts`
```typescript
interface CategorizationResult {
  success: boolean
  categorizedTransactions?: ProcessedTransaction[]
}
```
- Aplica categorização automática
- Garante categorias padrão para o usuário

### 4. Módulos de Persistência

#### `createImportRecord.ts`
```typescript
interface ImportRecordResult {
  success: boolean
  csvImport?: any
  finalHash?: string
  finalFilename?: string
}
```
- Cria registro na tabela `csv_imports`
- Trata conflitos de hash únicos

#### `saveTransactions.ts`
```typescript
interface SaveTransactionsResult {
  success: boolean
  transactionsCount?: number
}
```
- Salva transações na tabela `transactions`
- Atualiza status do import para concluído

### 5. Módulos de Análise

#### `statsCalculator.ts`
```typescript
interface StatsResult {
  categorizedCount: number
  categoryStats: Record<string, CategoryStats>
}
```
- Calcula estatísticas de categorização
- Foca apenas em despesas (débitos)

## Vantagens da Estrutura Modular

### ✅ Manutenibilidade
- Cada arquivo tem uma responsabilidade única
- Código mais fácil de entender e modificar
- Redução de acoplamento entre componentes

### ✅ Testabilidade
- Cada módulo pode ser testado independentemente
- Interfaces bem definidas facilitam mocking
- Cobertura de testes mais granular

### ✅ Reutilização
- Módulos podem ser reutilizados em outros contextos
- Funcionalidades isoladas e bem definidas
- Easier to extend with new features

### ✅ Performance
- Imports mais eficientes (tree-shaking)
- Carregamento sob demanda quando necessário
- Melhor paralelização de operações

## Padrões de Uso

### Importação de Módulos
```typescript
// Usar exports nomeados dos índices
import { validateFile, checkDuplicates } from '../_utils'
import { createImportRecord, saveTransactions } from '../_data'

// Ou imports diretos quando necessário
import calculateStats from '../_utils/statsCalculator'
```

### Tratamento de Erros
Todos os módulos seguem o mesmo padrão de resposta:
```typescript
interface ModuleResult {
  success: boolean
  error?: string
  // ... dados específicos do módulo
}
```

### Logging Consistente
- Cada módulo inclui logs descritivos
- Emojis para facilitar identificação visual
- Logs de erro incluem contexto relevante

## Próximos Passos

1. **Testes Unitários**: Criar testes para cada módulo
2. **Validação de Tipos**: Melhorar tipagem com schemas Zod
3. **Cache**: Implementar cache para operações repetitivas
4. **Monitoramento**: Adicionar métricas de performance
5. **Documentação API**: Gerar docs automáticas dos tipos 