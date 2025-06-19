-- Script para configurar Storage do Supabase
-- Execute APÓS as tabelas estarem criadas

-- PASSO 1: Criar bucket para arquivos CSV
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csv-files', 'csv-files', false)
ON CONFLICT (id) DO NOTHING;

-- PASSO 2: Verificar se o bucket foi criado
SELECT id, name, public FROM storage.buckets WHERE id = 'csv-files';

-- PASSO 3: Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can upload their own CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own CSV files" ON storage.objects;

-- PASSO 4: Criar políticas de storage
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

-- PASSO 5: Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%CSV%' OR policyname LIKE '%csv%'; 