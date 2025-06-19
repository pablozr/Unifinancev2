-- Script para corrigir a tabela transactions
-- Execute este script no Supabase SQL Editor

-- PASSO 1: Verificar se as tabelas existem
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('csv_imports', 'transactions', 'monthly_summaries');

-- PASSO 2: Dropar a tabela transactions se existir (para recriar corretamente)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS monthly_summaries CASCADE;

-- PASSO 3: Recriar csv_imports primeiro (se não existir)
CREATE TABLE IF NOT EXISTS csv_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  total_rows INTEGER NOT NULL,
  valid_rows INTEGER NOT NULL,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 4: Criar transactions (APÓS csv_imports existir)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  csv_import_id UUID NOT NULL REFERENCES csv_imports(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  category TEXT,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 5: Criar monthly_summaries (APÓS transactions existir)
CREATE TABLE monthly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  csv_import_id UUID NOT NULL REFERENCES csv_imports(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  total_income DECIMAL(12,2) DEFAULT 0,
  total_expenses DECIMAL(12,2) DEFAULT 0,
  net_balance DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, csv_import_id, month, year)
);

-- PASSO 6: Criar índices
CREATE INDEX idx_csv_imports_user_id ON csv_imports(user_id);
CREATE INDEX idx_csv_imports_status ON csv_imports(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_csv_import_id ON transactions(csv_import_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_month_year ON transactions(month, year);
CREATE INDEX idx_monthly_summaries_user_id ON monthly_summaries(user_id);
CREATE INDEX idx_monthly_summaries_month_year ON monthly_summaries(month, year);

-- PASSO 7: Ativar RLS
ALTER TABLE csv_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- PASSO 8: Criar políticas RLS
-- csv_imports policies
DROP POLICY IF EXISTS "Users can view their own CSV imports" ON csv_imports;
DROP POLICY IF EXISTS "Users can insert their own CSV imports" ON csv_imports;
DROP POLICY IF EXISTS "Users can update their own CSV imports" ON csv_imports;
DROP POLICY IF EXISTS "Users can delete their own CSV imports" ON csv_imports;

CREATE POLICY "Users can view their own CSV imports" ON csv_imports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CSV imports" ON csv_imports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CSV imports" ON csv_imports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CSV imports" ON csv_imports
  FOR DELETE USING (auth.uid() = user_id);

-- transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- monthly_summaries policies
DROP POLICY IF EXISTS "Users can view their own monthly summaries" ON monthly_summaries;
DROP POLICY IF EXISTS "Users can insert their own monthly summaries" ON monthly_summaries;
DROP POLICY IF EXISTS "Users can update their own monthly summaries" ON monthly_summaries;
DROP POLICY IF EXISTS "Users can delete their own monthly summaries" ON monthly_summaries;

CREATE POLICY "Users can view their own monthly summaries" ON monthly_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly summaries" ON monthly_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly summaries" ON monthly_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly summaries" ON monthly_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- PASSO 9: Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_csv_imports_updated_at ON csv_imports;
DROP TRIGGER IF EXISTS update_monthly_summaries_updated_at ON monthly_summaries;

CREATE TRIGGER update_csv_imports_updated_at 
  BEFORE UPDATE ON csv_imports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_summaries_updated_at 
  BEFORE UPDATE ON monthly_summaries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PASSO 10: Verificar se tudo foi criado corretamente
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('csv_imports', 'transactions', 'monthly_summaries')
ORDER BY table_name;

-- PASSO 11: Verificar colunas da tabela transactions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions'
ORDER BY ordinal_position; 