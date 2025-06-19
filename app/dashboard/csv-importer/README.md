# 🤖 Categorização Automática de Transações

## Visão Geral

O sistema de categorização automática analisa a descrição das transações durante a importação do CSV e as categoriza automaticamente baseado em palavras-chave predefinidas.

## Funcionalidades

### ✨ Categorização Inteligente
- **Análise de texto**: Remove acentos, normaliza texto e compara com palavras-chave
- **Score de confiança**: Calcula um percentual de confiança na categorização
- **Categorias padrão**: Cria automaticamente 9 categorias essenciais
- **Regras avançadas**: Aplica lógica adicional para casos especiais

### 📊 Categorias Padrão

#### 🍔 Alimentação
- **Palavras-chave**: ifood, uber eats, restaurante, mercado, supermercado, padaria, pizza, etc.
- **Cor**: Verde (#10B981)

#### 🚗 Transporte  
- **Palavras-chave**: uber, 99, taxi, riopar, riocard, gasolina, posto, metro, ônibus, etc.
- **Cor**: Azul (#3B82F6)

#### 🏥 Saúde
- **Palavras-chave**: farmácia, médico, hospital, clínica, dentista, remédio, exame, etc.
- **Cor**: Vermelho (#EF4444)

#### 🏠 Casa
- **Palavras-chave**: aluguel, condomínio, luz, água, gás, internet, telefone, IPTU, etc.
- **Cor**: Laranja (#F59E0B)

#### 🎮 Lazer
- **Palavras-chave**: netflix, spotify, cinema, teatro, show, viagem, hotel, academia, etc.
- **Cor**: Roxo (#8B5CF6)

#### 📚 Educação
- **Palavras-chave**: escola, universidade, curso, material escolar, mensalidade, etc.
- **Cor**: Ciano (#06B6D4)

#### 👕 Vestuário
- **Palavras-chave**: roupa, sapato, perfume, maquiagem, cabeleireiro, etc.
- **Cor**: Rosa (#EC4899)

#### 📈 Investimentos
- **Palavras-chave**: investimento, poupança, CDB, ações, fundos, corretora, etc.
- **Cor**: Verde escuro (#059669)

#### 📦 Outros
- **Padrão**: Para transações que não se encaixam em outras categorias
- **Cor**: Cinza (#6B7280)

## Como Funciona

### 1. **Processamento do CSV**
```typescript
// Durante o upload, as transações são automaticamente categorizadas
const categorizedTransactions = categorizeTransactions(validatedData.validRows)
```

### 2. **Algoritmo de Match**
- Remove acentos e pontuação do texto
- Compara palavras da descrição com keywords das categorias
- Calcula score baseado em matches exatos e parciais
- Aplica threshold mínimo de confiança (15%)

### 3. **Regras Avançadas**
- Transferências e PIX → Outros
- Saques em ATM → Outros  
- Receitas altas → Manter genérico
- Pagamentos de cartão → Manter categoria detectada se confiança > 50%

### 4. **Visualização**
- Dashboard mostra estatísticas de categorização
- Percentual de transações categorizadas automaticamente
- Nível de confiança por categoria
- Interface visual para revisar categorizações

## Exemplos de Categorização

| Descrição | Categoria Detectada | Confiança |
|-----------|-------------------|-----------|
| "IFOOD*PIZZA EXPRESS" | Alimentação | 95% |
| "UBER *TRIP 123456" | Transporte | 90% |
| "FARMACIA SAO PAULO" | Saúde | 85% |
| "CONTA DE LUZ ENEL" | Casa | 88% |
| "NETFLIX.COM" | Lazer | 92% |

## Configuração

### Adição de Palavras-chave
Para adicionar novas palavras-chave, edite o arquivo:
```
app/dashboard/csv-importer/_data/getDefaultCategories.ts
```

### Ajuste de Threshold
Para mudar o nível mínimo de confiança:
```typescript
// Em autoCategorizer.ts
if (score > bestScore && score >= 15) { // Altere este valor
```

## Benefícios

- ⚡ **Automação**: Reduz trabalho manual de categorização
- 🎯 **Precisão**: Algoritmo inteligente com alta taxa de acerto
- 📊 **Visibilidade**: Relatórios detalhados de categorização
- 🔧 **Flexibilidade**: Fácil adição de novas categorias e keywords
- 💡 **Inteligência**: Aprende padrões e melhora com o tempo

## Próximos Passos

1. **Machine Learning**: Implementar aprendizado baseado em correções do usuário
2. **Categorias Customizadas**: Permitir que usuários criem suas próprias categorias
3. **Regras Personalizadas**: Interface para criar regras de categorização customizadas
4. **Histórico**: Manter histórico de categorizações para análise de padrões 