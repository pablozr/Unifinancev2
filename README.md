# 💰 UniFinance v2

<div align="center">

**Sistema Avançado de Gestão Financeira Pessoal com IA**

*Construído com Next.js 15, TypeScript, Supabase e Análise Preditiva*

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.2+-000?style=for-the-badge&logo=bun)](https://bun.sh/)

</div>

---

## 🎯 **Visão Geral**

UniFinance v2 é uma **plataforma financeira completa** que combina análise inteligente de dados, machine learning e uma interface moderna para oferecer insights profundos sobre sua vida financeira.

### ✨ **Principais Funcionalidades**

| 🧠 **IA Integrada** | 📊 **Dashboard Inteligente** | ⚡ **Performance Otimizada** |
|:---:|:---:|:---:|
| Categorização automática<br/>Análise preditiva | Visualizações em tempo real<br/>Métricas dinâmicas | Server Components<br/>Edge Runtime |

| 🔒 **Segurança Robusta** | 📱 **Mobile-First** | 🔄 **Real-time** |
|:---:|:---:|:---:|
| Supabase Auth + RLS<br/>Rate limiting | Responsivo completo<br/>PWA Ready | WebSockets<br/>Live updates |

---

## 🚀 **Funcionalidades Detalhadas**

### 📊 **Dashboard Inteligente**

**O que faz:**
- Centro de controle financeiro com visualizações avançadas
- Agregação automática de dados em tempo real
- Gráficos interativos de fluxo de caixa
- Cards de métricas com animações fluidas

**Tecnologias utilizadas:**
- **Server Components** para renderização otimizada
- **Framer Motion** para animações performáticas
- **Tailwind CSS** para styling responsivo
- **Custom hooks** para gestão de estado

### 📈 **Análise Preditiva com IA**

**O que faz:**
- Prevê tendências financeiras baseado em histórico
- Detecta padrões recorrentes automaticamente
- Calcula scores de confiança para previsões
- Gera recomendações personalizadas

**Como funciona:**
1. **Coleta de Dados** → Analisa histórico de transações
2. **Pattern Recognition** → Identifica padrões recorrentes
3. **Mathematical Analysis** → Aplica regressão linear e análise estatística
4. **Prediction** → Gera projeções para 30, 60 e 90 dias
5. **Confidence Scoring** → Calcula confiabilidade da predição

**Arquivos principais:**
```
app/dashboard/insights/_data/predictive/
├── cashFlowProjector.ts      # Projeção de fluxo de caixa
├── recurringDetector.ts      # Detecção de transações recorrentes
├── mathematicalAnalysis.ts   # Análises estatísticas
└── insightGenerator.ts       # Geração de insights
```

### 📁 **Importador CSV com IA**

**O que faz:**
- Processa extratos bancários automaticamente
- Categorização inteligente baseada em IA
- Detecção automática de duplicatas
- Validação robusta de dados

**Fluxo de processamento:**
```mermaid
graph LR
    A[Upload CSV] --> B[Validação]
    B --> C[Parsing]
    C --> D[IA Categorization]
    D --> E[Deduplication]
    E --> F[Save to DB]
    F --> G[Dashboard Update]
```

**Recursos avançados:**
- **Parser flexível** para múltiplos formatos
- **IA de categorização** com 95%+ de precisão
- **Detecção de duplicatas** baseada em regras inteligentes
- **Fallback validation** para dados inconsistentes

### 🔍 **Sistema de Insights**

**O que faz:**
- Análise profunda de padrões de gastos
- Identificação de anomalias financeiras
- Sugestões personalizadas de otimização
- Alertas inteligentes para metas

### 🔐 **Autenticação e Segurança**

**Camadas de segurança:**
- **Supabase Auth** com JWT tokens
- **Row Level Security (RLS)** no PostgreSQL
- **Middleware protection** para rotas
- **Rate limiting** inteligente
- **Input validation** com Zod schemas

---

## 🏗️ **Arquitetura Modular Avançada**

### 📁 **Estrutura por Features**

O projeto utiliza **arquitetura modular baseada em features** onde cada funcionalidade é completamente auto-contida:

```
unifinancev2/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Grupo de rotas - autenticação
│   │   ├── _components/              # Components específicos
│   │   │   ├── login-form.tsx        # Form de login otimizado
│   │   │   ├── register-form.tsx     # Form de registro
│   │   │   ├── forgot-form.tsx       # Recuperação de senha
│   │   │   └── index.ts              # Exports centralizados
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx                # Layout específico auth
│   │
│   ├── dashboard/                    # Feature principal
│   │   ├── _components/              # UI Components
│   │   │   ├── DashboardOverview.tsx # Overview principal
│   │   │   ├── DashboardCharts.tsx   # Gráficos interativos
│   │   │   ├── PeriodSelector.tsx    # Seletor temporal
│   │   │   └── index.ts              # Exports centralizados
│   │   ├── _actions/                 # Server Actions
│   │   │   ├── addSingleTransaction.ts
│   │   │   ├── getTransactionsClient.ts
│   │   │   └── delete/               # Submódulo exclusão
│   │   │       ├── deleteByFilters.ts
│   │   │       ├── deleteByPeriod.ts
│   │   │       └── index.ts
│   │   ├── _data/                    # Data fetching
│   │   │   ├── getAllTransactions.ts
│   │   │   ├── getDashboardStats.ts
│   │   │   └── utils/                # Utilitários específicos
│   │   │       ├── aggregationUtils.ts
│   │   │       ├── calculationUtils.ts
│   │   │       └── dateUtils.ts
│   │   │
│   │   ├── csv-importer/             # Submódulo CSV
│   │   │   ├── _actions/             # Server actions CSV
│   │   │   │   ├── uploadAndProcess.ts
│   │   │   │   ├── parser.ts
│   │   │   │   └── validator.ts
│   │   │   ├── _utils/               # Utilitários CSV
│   │   │   │   ├── categorization/   # IA para categorização
│   │   │   │   │   ├── advancedRules.ts
│   │   │   │   │   ├── patternDetector.ts
│   │   │   │   │   └── scoringEngine.ts
│   │   │   │   └── csvProcessor.ts
│   │   │   └── page.tsx
│   │   │
│   │   └── insights/                 # Submódulo Insights
│   │       ├── _data/                # Data para insights
│   │       │   ├── getSmartInsights.ts
│   │       │   └── predictive/       # IA Preditiva
│   │       │       ├── cashFlowProjector.ts
│   │       │       ├── recurringDetector.ts
│   │       │       └── mathematicalAnalysis.ts
│   │       └── page.tsx
│   │
│   └── landing/                      # Landing page
│       ├── _components/
│       │   ├── hero.tsx              # Hero section
│       │   ├── features-section.tsx  # Features
│       │   └── footer.tsx            # Footer
│       └── page.tsx
│
├── components/ui/                    # Components globais
│   ├── auth-provider.tsx             # Provider de autenticação
│   ├── user-menu.tsx                # Menu do usuário
│   └── button.tsx                   # Componente base
│
├── lib/                              # Biblioteca central
│   ├── supabase/                     # Configuração Supabase
│   │   ├── client.ts                 # Cliente browser
│   │   ├── server.ts                 # Cliente servidor
│   │   └── database.ts               # Utilitários DB
│   ├── types/                        # Tipos TypeScript
│   │   ├── database.ts               # Tipos do banco
│   │   └── bun.d.ts                  # Tipos Bun test
│   ├── utils/                        # Utilitários globais
│   │   ├── currency.ts               # Formatação moeda
│   │   └── validDate.ts              # Validação datas
│   ├── validations/                  # Schemas Zod
│   │   ├── auth.ts                   # Validações auth
│   │   └── transaction.ts            # Validações transação
│   └── auth.ts                       # Utilitários auth
│
├── tests/                            # Testes espelhados
│   ├── app/dashboard/_data/          # Testes features
│   └── lib/utils/                    # Testes utilitários
│
├── supabase/                         # Scripts SQL
│   ├── schema.sql                    # Schema principal
│   └── setup-storage.sql             # Storage config
│
└── docs/                             # Documentação
    ├── DEPLOYMENT.md
    └── EMAIL_SETUP_GUIDE.md
```

### 🔄 **Princípios Arquiteturais**

#### **1. Feature-First Organization**
- Cada feature é auto-contida com seus próprios `_actions`, `_data`, `_components`
- Reduz acoplamento entre módulos
- Facilita manutenção e testes

#### **2. Server/Client Separation**
- **Server Components** por padrão (melhor performance)
- **Client Components** apenas quando necessário
- **Server Actions** para todas as mutações de estado

#### **3. Type Safety First**
- TypeScript strict mode
- Zod para validação runtime
- Database types auto-gerados
- Interfaces bem definidas

---

## 🛠️ **Stack Tecnológica**

### **Frontend**
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 15.3.3 | Framework React com App Router |
| **React** | 19 | UI library com Server Components |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 3.4.17 | Styling utility-first |
| **Framer Motion** | 12.16.0 | Animações performáticas |

### **Backend & Database**
| Tecnologia | Propósito |
|------------|-----------|
| **Supabase** | Backend-as-a-Service completo |
| **PostgreSQL** | Banco relacional com RLS |
| **Supabase Auth** | Autenticação robusta |
| **Edge Functions** | Serverless functions |

### **Development & Testing**
| Ferramenta | Propósito |
|------------|-----------|
| **Bun** | Runtime JavaScript ultra-rápido |
| **Bun Test** | Framework de testes nativo |
| **ESLint** | Linting de código |
| **TypeScript** | Verificação de tipos |

---

## 🚀 **Setup Completo Passo a Passo**

### **📋 Pré-requisitos**

```bash
# Verificar versões necessárias
node --version    # v18+ (recomendado v20+)
bun --version     # v1.2+ (recomendado)
git --version     # Qualquer versão recente
```

### **⚡ Instalação Rápida**

```bash
# 1. Clone e instale
git clone https://github.com/seu-usuario/unifinancev2.git
cd unifinancev2
bun install

# 2. Configure environment
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 3. Execute
bun dev
```

### **🔧 Setup Detalhado**

#### **1. Configuração do Supabase**

**1.1. Criar Projeto**
1. Acesse [supabase.com](https://supabase.com) → "New Project"
2. Configure:
   - **Name**: UniFinance v2
   - **Database Password**: Senha forte (anote!)
   - **Region**: Mais próxima da sua localização

**1.2. Configurar Schema**
```bash
# No Supabase Dashboard → SQL Editor
# Execute os arquivos na ordem:

1. supabase/schema.sql           # Schema principal
2. supabase/setup-storage.sql    # Configuração storage
3. supabase/add-sample-categories.sql  # Dados exemplo (opcional)
```

**1.3. Configurar Autenticação**
```bash
# Authentication → Settings
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback

# Authentication → Providers
✅ Email (habilitar)
🔧 SMTP (configurar para emails customizados)
```

#### **2. Environment Variables**

```bash
# .env.local
# Encontre essas informações em Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Database - Project Settings → Database
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma-string-secreta-aleatoria
```

#### **3. Verificação e Testes**

```bash
# Testar instalação
bun dev                    # Servidor development
bun test                   # Executar testes
bun run build             # Build produção
bun run db:test-sync      # Testar sync usuários
```

---

## 📝 **Scripts e Comandos**

### **Development**
```bash
bun dev                   # Servidor dev com Turbopack
bun dev --port 4000      # Servidor em porta específica
DEBUG=1 bun dev          # Development com debug
```

### **Production**
```bash
bun run build           # Build otimizado
bun start               # Servidor produção
bun run build && bun start  # Build + start
```

### **Quality & Testing**
```bash
bun test                # Todos os testes
bun test --watch        # Testes em watch mode
bun test --coverage     # Coverage report
bun run lint            # Linting
npx tsc --noEmit        # Type checking
```

### **Database & Utils**
```bash
bun run db:test-sync    # Testar sync usuários
npx @next/bundle-analyzer  # Analisar bundle
```

---

## 🧪 **Testing Strategy**

### **Estrutura de Testes**
```
tests/
├── app/                    # Testes de features
│   └── dashboard/
│       └── _data/          # Testes data layer
├── lib/                    # Testes utilitários
│   ├── utils/              # Testes funções utils
│   └── schemas.test.ts     # Testes validação
└── setup/                  # Setup de testes
```

### **Tipos de Testes**

**Unit Tests**
```typescript
// tests/lib/utils/currency.test.ts
import { describe, it, expect } from 'bun:test'
import { formatCurrency } from '@/lib/utils/currency'

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
  })
})
```

**Integration Tests**
```typescript
// tests/app/dashboard/_data/stats.test.ts
import { describe, it, expect } from 'bun:test'
import { getDashboardStats } from '@/app/dashboard/_data'

describe('getDashboardStats', () => {
  it('returns correct stats structure', async () => {
    const stats = await getDashboardStats('user-id')
    expect(stats).toHaveProperty('totalIncome')
    expect(stats).toHaveProperty('totalExpenses')
  })
})
```

---

## 🚀 **Deploy em Produção**

### **Vercel (Recomendado)**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Configure environment variables no dashboard
# Adicione todas as variáveis do .env.local
```

### **Docker (Alternativo)**

```dockerfile
# Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "start"]
```

---

## 🤝 **Contribuição**

### **Processo**
```bash
# 1. Fork → Clone → Branch
git checkout -b feature/amazing-feature

# 2. Develop → Test → Commit
bun test && bun run lint
git commit -m "feat: add amazing feature"

# 3. Push → PR
git push origin feature/amazing-feature
```

### **Padrões de Commit**
```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
refactor: refatoração
test: testes
chore: manutenção
```

---

## 📚 **Documentação**

- **[Deploy Guide](./docs/DEPLOYMENT.md)** - Guia completo de deploy
- **[Email Setup](./docs/EMAIL_SETUP_GUIDE.md)** - Configuração SMTP
- **[Security Guide](./docs/PASSWORD_RESET_SECURITY.md)** - Práticas de segurança
- **[Architecture](./HIERARCHICAL_STRUCTURE.md)** - Arquitetura detalhada

---

## 📄 **Licença**

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

<div align="center">

**💰 Desenvolvido com ❤️ para revolucionar sua gestão financeira**

*Se este projeto te ajudou, considere dar uma ⭐!*

**[🚀 Demo Live](https://unifinancev2.vercel.app)** • **[📖 Docs](./docs/)** • **[🐛 Issues](https://github.com/issues)** • **[💡 Features](https://github.com/discussions)**

</div>