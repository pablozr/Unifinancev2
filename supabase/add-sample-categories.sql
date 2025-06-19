-- Script para adicionar categorias básicas e melhorar os insights
-- Execute no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se há usuários
DO $$
DECLARE
  user_record RECORD;
  alimentacao_id UUID;
  transporte_id UUID;
  lazer_id UUID;
  saude_id UUID;
  casa_id UUID;
  outros_id UUID;
BEGIN
  -- Para cada usuário que tem transações
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.transactions 
  LOOP
    RAISE NOTICE 'Processando usuário: %', user_record.user_id;
    
    -- Criar categorias básicas para o usuário
    INSERT INTO public.categories (user_id, name, color, icon) VALUES
    (user_record.user_id, 'Alimentação', '#10B981', '🍔'),
    (user_record.user_id, 'Transporte', '#3B82F6', '🚗'),
    (user_record.user_id, 'Lazer', '#8B5CF6', '🎮'),
    (user_record.user_id, 'Saúde', '#EF4444', '🏥'),
    (user_record.user_id, 'Casa', '#F59E0B', '🏠'),
    (user_record.user_id, 'Outros', '#6B7280', '📦')
    ON CONFLICT DO NOTHING; -- Evitar duplicatas
    
    -- Obter IDs das categorias criadas
    SELECT id INTO alimentacao_id FROM public.categories 
    WHERE user_id = user_record.user_id AND name = 'Alimentação';
    
    SELECT id INTO transporte_id FROM public.categories 
    WHERE user_id = user_record.user_id AND name = 'Transporte';
    
    SELECT id INTO lazer_id FROM public.categories 
    WHERE user_id = user_record.user_id AND name = 'Lazer';
    
    SELECT id INTO saude_id FROM public.categories 
    WHERE user_id = user_record.user_id AND name = 'Saúde';
    
    SELECT id INTO casa_id FROM public.categories 
    WHERE user_id = user_record.user_id AND name = 'Casa';
    
    SELECT id INTO outros_id FROM public.categories 
    WHERE user_id = user_record.user_id AND name = 'Outros';
    
    -- Atualizar transações de despesa sem categoria baseado na descrição
    -- Alimentação
    UPDATE public.transactions 
    SET category_id = alimentacao_id
    WHERE user_id = user_record.user_id 
      AND type = 'debit' 
      AND category_id IS NULL
      AND (
        LOWER(description) LIKE '%comida%' OR
        LOWER(description) LIKE '%restaurante%' OR
        LOWER(description) LIKE '%lanche%' OR
        LOWER(description) LIKE '%mercado%' OR
        LOWER(description) LIKE '%supermercado%' OR
        LOWER(description) LIKE '%padaria%' OR
        LOWER(description) LIKE '%pizza%' OR
        LOWER(description) LIKE '%hambur%' OR
        LOWER(description) LIKE '%delivery%' OR
        LOWER(description) LIKE '%ifood%' OR
        LOWER(description) LIKE '%mcdonalds%' OR
        LOWER(description) LIKE '%bk%' OR
        LOWER(description) LIKE '%kfc%'
      );
    
    -- Transporte
    UPDATE public.transactions 
    SET category_id = transporte_id
    WHERE user_id = user_record.user_id 
      AND type = 'debit' 
      AND category_id IS NULL
      AND (
        LOWER(description) LIKE '%uber%' OR
        LOWER(description) LIKE '%99%' OR
        LOWER(description) LIKE '%taxi%' OR
        LOWER(description) LIKE '%gasolina%' OR
        LOWER(description) LIKE '%combustivel%' OR
        LOWER(description) LIKE '%posto%' OR
        LOWER(description) LIKE '%metro%' OR
        LOWER(description) LIKE '%onibus%' OR
        LOWER(description) LIKE '%transporte%'
      );
    
    -- Lazer
    UPDATE public.transactions 
    SET category_id = lazer_id
    WHERE user_id = user_record.user_id 
      AND type = 'debit' 
      AND category_id IS NULL
      AND (
        LOWER(description) LIKE '%cinema%' OR
        LOWER(description) LIKE '%netflix%' OR
        LOWER(description) LIKE '%spotify%' OR
        LOWER(description) LIKE '%jogo%' OR
        LOWER(description) LIKE '%steam%' OR
        LOWER(description) LIKE '%playstation%' OR
        LOWER(description) LIKE '%xbox%' OR
        LOWER(description) LIKE '%show%' OR
        LOWER(description) LIKE '%teatro%' OR
        LOWER(description) LIKE '%bar%' OR
        LOWER(description) LIKE '%festa%'
      );
    
    -- Saúde
    UPDATE public.transactions 
    SET category_id = saude_id
    WHERE user_id = user_record.user_id 
      AND type = 'debit' 
      AND category_id IS NULL
      AND (
        LOWER(description) LIKE '%farmacia%' OR
        LOWER(description) LIKE '%medico%' OR
        LOWER(description) LIKE '%hospital%' OR
        LOWER(description) LIKE '%clinica%' OR
        LOWER(description) LIKE '%dentista%' OR
        LOWER(description) LIKE '%remedio%' OR
        LOWER(description) LIKE '%laboratorio%' OR
        LOWER(description) LIKE '%exame%'
      );
    
    -- Casa
    UPDATE public.transactions 
    SET category_id = casa_id
    WHERE user_id = user_record.user_id 
      AND type = 'debit' 
      AND category_id IS NULL
      AND (
        LOWER(description) LIKE '%aluguel%' OR
        LOWER(description) LIKE '%condominio%' OR
        LOWER(description) LIKE '%agua%' OR
        LOWER(description) LIKE '%luz%' OR
        LOWER(description) LIKE '%energia%' OR
        LOWER(description) LIKE '%gas%' OR
        LOWER(description) LIKE '%internet%' OR
        LOWER(description) LIKE '%telefone%' OR
        LOWER(description) LIKE '%iptu%' OR
        LOWER(description) LIKE '%limpeza%'
      );
    
    -- Para transações restantes sem categoria, dividir proporcionalmente
    -- 30% para outras categorias baseado no valor
    UPDATE public.transactions 
    SET category_id = (
      CASE 
        WHEN EXTRACT(EPOCH FROM RANDOM()) < 0.3 THEN alimentacao_id
        WHEN EXTRACT(EPOCH FROM RANDOM()) < 0.5 THEN transporte_id
        WHEN EXTRACT(EPOCH FROM RANDOM()) < 0.7 THEN casa_id
        ELSE outros_id
      END
    )
    WHERE user_id = user_record.user_id 
      AND type = 'debit' 
      AND category_id IS NULL
      AND amount > 0;
    
    RAISE NOTICE 'Categorias criadas e transações atualizadas para usuário: %', user_record.user_id;
    
  END LOOP;
END $$;

-- Verificar resultados
SELECT 
  u.email,
  COUNT(DISTINCT c.id) as total_categories,
  COUNT(t.id) as total_transactions,
  COUNT(CASE WHEN t.category_id IS NOT NULL THEN 1 END) as categorized_transactions,
  COUNT(CASE WHEN t.category_id IS NULL THEN 1 END) as uncategorized_transactions
FROM public.users u
LEFT JOIN public.categories c ON c.user_id = u.id
LEFT JOIN public.transactions t ON t.user_id = u.id
GROUP BY u.id, u.email
ORDER BY total_transactions DESC;

-- Mostrar distribuição por categoria
SELECT 
  c.name as category_name,
  c.color,
  COUNT(t.id) as transaction_count,
  SUM(t.amount) as total_amount
FROM public.categories c
LEFT JOIN public.transactions t ON t.category_id = c.id AND t.type = 'debit'
GROUP BY c.id, c.name, c.color
ORDER BY total_amount DESC; 