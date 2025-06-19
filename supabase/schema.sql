-- Schema para CSV Importer
-- Execute este SQL no Supabase SQL Editor

-- Tabela para armazenar informações dos arquivos CSV importados
CREATE TABLE IF NOT EXISTS csv_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Caminho no Supabase Storage
  file_size INTEGER NOT NULL,
  total_rows INTEGER NOT NULL,
  valid_rows INTEGER NOT NULL,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar as transações processadas
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  csv_import_id UUID REFERENCES csv_imports(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('credit', 'debit')) NOT NULL,
  category TEXT,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar dados mensais agregados
CREATE TABLE IF NOT EXISTS monthly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  csv_import_id UUID REFERENCES csv_imports(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_income DECIMAL(12,2) DEFAULT 0,
  total_expenses DECIMAL(12,2) DEFAULT 0,
  net_balance DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, csv_import_id, month, year)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_csv_imports_user_id ON csv_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_csv_imports_status ON csv_imports(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_csv_import_id ON transactions(csv_import_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_month_year ON transactions(month, year);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_id ON monthly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_month_year ON monthly_summaries(month, year);

-- RLS (Row Level Security) Policies
ALTER TABLE csv_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Políticas para csv_imports
CREATE POLICY "Users can view their own CSV imports" ON csv_imports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CSV imports" ON csv_imports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CSV imports" ON csv_imports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CSV imports" ON csv_imports
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para monthly_summaries
CREATE POLICY "Users can view their own monthly summaries" ON monthly_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly summaries" ON monthly_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly summaries" ON monthly_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly summaries" ON monthly_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_csv_imports_updated_at 
  BEFORE UPDATE ON csv_imports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_summaries_updated_at 
  BEFORE UPDATE ON monthly_summaries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket para arquivos CSV
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csv-files', 'csv-files', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para arquivos CSV
CREATE POLICY "Users can upload their own CSV files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'csv-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own CSV files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'csv-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own CSV files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'csv-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ); 