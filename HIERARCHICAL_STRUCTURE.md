# 🏗️ Estrutura Hierárquica Modular - UniFi Finance v2

## 📁 Nova Organização por Localização de Uso

A aplicação foi reorganizada seguindo o padrão **"modular por proximidade"** - cada função fica próxima de onde é utilizada:

## 🔐 **app/auth/** - Seção de Autenticação

### **app/auth/_actions/**
```typescript
// Actions de autenticação
import { login, register, logout } from '@/app/auth/_actions'
```

**Arquivos:**
- `login.ts` - Autenticação de usuário
- `register.ts` - Registro de nova conta 
- `logout.ts` - Logout do usuário
- `index.ts` - Exports centralizados

### **app/auth/_components/**
```typescript
// Componentes de auth
import { LogoutButton } from '@/app/auth/_components'
```

**Arquivos:**
- `LogoutButton.tsx` - Botão de logout
- `index.ts` - Exports centralizados

---

## 📊 **app/dashboard/** - Dashboard Principal

### **app/dashboard/_data/**
```typescript
// Dados do dashboard
import { getTransactions, getFinancialStats } from '@/app/dashboard/_data'
```

**Arquivos:**
- `getTransactions.ts` - Buscar transações com filtros
- `getFinancialStats.ts` - Estatísticas financeiras
- `index.ts` - Exports centralizados

### **app/dashboard/_actions/**
```typescript
// Actions do dashboard
import { deleteTransactions } from '@/app/dashboard/_actions'
```

**Arquivos:**
- `deleteTransactions.ts` - Deletar transações com filtros
- `index.ts` - Exports centralizados

---

## 📄 **app/dashboard/csv-importer/** - CSV Importer

### **app/dashboard/csv-importer/_data/**
```typescript
// Dados de CSV
import getCsvImports from '@/app/dashboard/csv-importer/_data/getCsvImports'
```

**Arquivos:**
- `getCsvImports.ts` - Buscar histórico de imports

### **app/dashboard/csv-importer/_actions/**
```typescript
// Actions de CSV
import uploadAndProcess from '@/app/dashboard/csv-importer/_actions/uploadAndProcess'
```

**Arquivos:**
- `uploadAndProcess.ts` - Upload e processamento de CSV

### **app/dashboard/csv-importer/_components/**
```typescript
// Componentes de CSV
import UploadForm from '@/app/dashboard/csv-importer/_components/UploadForm'
```

**Arquivos:**
- `UploadForm.tsx` - Formulário de upload

---

## 📈 **app/dashboard/insights/** - Insights

### **app/dashboard/insights/_data/**
```typescript
// Dados de insights
import getCashFlowData from '@/app/dashboard/insights/_data/getCashFlowData'
```

**Arquivos:**
- `getCashFlowData.ts` - Dados de fluxo de caixa

### **app/dashboard/insights/_components/**
```typescript
// Componentes de insights
import PeriodSelector from '@/app/dashboard/insights/_components/PeriodSelector'
```

**Arquivos:**
- `PeriodSelector.tsx` - Seletor de período para insights

---

## 🌐 **lib/_data/** - Funções Globais

```typescript
// Funções usadas em várias seções
import getUser from '@/lib/_data/getUser'
```

**Arquivos:**
- `getUser.ts` - Buscar usuário autenticado (usado em todo app)

---

## 🧩 **components/_components/** - Componentes Globais

```typescript
// Componentes usados em várias seções
import { AuthProvider, useAuth } from '@/components/_components'
```

**Arquivos:**
- `AuthProvider.tsx` - Provider de contexto global
- `index.ts` - Exports centralizados

---

## ✨ **Vantagens da Estrutura Hierárquica**

### 🎯 **Localização por Uso**
- Funções ficam próximas de onde são utilizadas
- Fácil localizar e modificar código específico
- Reduz coupling entre seções

### 📊 **Escalabilidade**
- Cada seção é independente
- Novos módulos podem ser adicionados facilmente
- Estrutura clara e previsível

### 🚀 **Manutenibilidade**
- Mudanças ficam isoladas na seção específica
- Testes podem ser organizados por seção
- Deploy parcial possível

### 🔍 **Organização Clara**
```
app/
├── auth/                    # Tudo relacionado à autenticação
│   ├── _actions/           # Actions de auth
│   ├── _components/        # Componentes de auth
│   └── _data/             # Dados de auth (se houver)
├── dashboard/              # Dashboard principal
│   ├── _data/             # Dados do dashboard
│   ├── _actions/          # Actions do dashboard
│   ├── csv-importer/      # Módulo CSV
│   │   ├── _data/         # Dados específicos de CSV
│   │   ├── _actions/      # Actions específicas de CSV
│   │   └── _components/   # Componentes específicos de CSV
│   └── insights/          # Módulo Insights
│       ├── _data/         # Dados específicos de insights
│       └── _components/   # Componentes específicos de insights
```

## 📝 **Padrões de Uso**

### ✅ **Import Específico por Localização**
```typescript
// Para auth
import login from '@/app/auth/_actions/login'
import { LogoutButton } from '@/app/auth/_components'

// Para dashboard
import { getTransactions } from '@/app/dashboard/_data'
import { deleteTransactions } from '@/app/dashboard/_actions'

// Para CSV importer
import getCsvImports from '@/app/dashboard/csv-importer/_data/getCsvImports'
import uploadAndProcess from '@/app/dashboard/csv-importer/_actions/uploadAndProcess'

// Para insights
import getCashFlowData from '@/app/dashboard/insights/_data/getCashFlowData'

// Para funções globais
import getUser from '@/lib/_data/getUser'
import { AuthProvider } from '@/components/_components'
```

### 🎨 **Exemplo Completo**
```typescript
// app/dashboard/page.tsx
import getUser from '@/lib/_data/getUser'
import { getTransactions, getFinancialStats } from './_data'
import { deleteTransactions } from './_actions'

export default async function DashboardPage() {
  const user = await getUser()
  const transactions = await getTransactions({ userId: user.id })
  const stats = await getFinancialStats(user.id)
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  )
}
```

```typescript
// app/dashboard/csv-importer/page.tsx
import getUser from '@/lib/_data/getUser'
import getCsvImports from './_data/getCsvImports'
import UploadForm from './_components/UploadForm'

export default async function CsvImporterPage() {
  const user = await getUser()
  const imports = await getCsvImports(user.id)
  
  return (
    <div>
      <h1>CSV Importer</h1>
      <UploadForm onSuccess={handleSuccess} />
      {/* CSV importer content */}
    </div>
  )
}
```

## 🔄 **Migração Completa**

### ❌ **Estrutura Antiga (removida):**
```
_data/           # ❌ Removido
_actions/        # ❌ Removido  
_components/     # ❌ Removido
```

### ✅ **Estrutura Nova:**
```
app/auth/_actions/
app/auth/_components/
app/dashboard/_data/
app/dashboard/_actions/
app/dashboard/csv-importer/_data/
app/dashboard/csv-importer/_actions/
app/dashboard/csv-importer/_components/
app/dashboard/insights/_data/
app/dashboard/insights/_components/
lib/_data/
components/_components/
```

---

**🎉 A nova estrutura hierárquica torna o código mais organizado, escalável e manutenível por localização de uso!** 