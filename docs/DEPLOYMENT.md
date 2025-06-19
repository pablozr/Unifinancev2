# 🚀 Guia de Deploy para Produção

## 📋 Visão Geral

Este documento descreve as melhores práticas para fazer deploy da aplicação UniFinance em produção, incluindo a sincronização de usuários entre Supabase Auth e nossa base de dados.

## 🏗️ Arquitetura de Sincronização

### Como Funciona
- **Supabase Auth** gerencia autenticação (`auth.users`)
- **Triggers PostgreSQL** sincronizam automaticamente com `public.users`
- **Prisma Migrations** versiona todas as mudanças no banco

### Vantagens desta Abordagem
✅ **Versionamento**: Todas as mudanças são versionadas via Prisma  
✅ **Reproduzível**: Funciona igual em dev, staging e produção  
✅ **Rollback**: Possível reverter mudanças se necessário  
✅ **CI/CD Ready**: Integra facilmente com pipelines automatizados  

## 🔄 Processo de Deploy

### 1. Ambiente de Desenvolvimento
```bash
# Aplicar migrations localmente
npm run db:generate
npx prisma migrate dev

# Testar sincronização
npm run db:test-sync
```

### 2. Ambiente de Staging
```bash
# Aplicar migrations em staging
npx prisma migrate deploy

# Verificar se tudo funcionou
npm run db:test-sync
```

### 3. Ambiente de Produção
```bash
# Deploy das migrations
npx prisma migrate deploy

# Verificar sincronização (opcional)
npm run db:test-sync
```

## 🔧 Configuração de Ambientes

### Variáveis de Ambiente Necessárias

#### Desenvolvimento (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL="sua-url-dev"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key-dev"
SUPABASE_SERVICE_ROLE_KEY="sua-service-key-dev"
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

#### Produção
```env
NEXT_PUBLIC_SUPABASE_URL="sua-url-prod"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key-prod"
SUPABASE_SERVICE_ROLE_KEY="sua-service-key-prod"
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

## 🚨 Checklist de Deploy

### Antes do Deploy
- [ ] Testar migrations em ambiente de staging
- [ ] Verificar se triggers estão funcionando
- [ ] Backup do banco de produção
- [ ] Verificar variáveis de ambiente

### Durante o Deploy
- [ ] Aplicar migrations: `npx prisma migrate deploy`
- [ ] Verificar se não há erros
- [ ] Testar criação de usuário

### Após o Deploy
- [ ] Executar teste de sincronização
- [ ] Monitorar logs por alguns minutos
- [ ] Testar fluxo completo de registro/login

## 🔍 Monitoramento

### Logs Importantes
```sql
-- Verificar triggers ativos
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
  AND event_object_table = 'users';

-- Verificar sincronização
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users;
```

### Alertas Recomendados
- Diferença entre contagem de `auth.users` e `public.users`
- Erros nos logs de triggers
- Falhas em migrations

## 🛠️ Troubleshooting

### Problema: Usuários não sincronizando
```sql
-- Verificar se triggers existem
SELECT * FROM information_schema.triggers 
WHERE trigger_schema = 'auth' AND event_object_table = 'users';

-- Recriar triggers se necessário
-- (executar migration novamente)
```

### Problema: Migration falhou
```bash
# Verificar status
npx prisma migrate status

# Marcar migration como aplicada (se já foi aplicada manualmente)
npx prisma migrate resolve --applied MIGRATION_NAME
```

### Problema: Dados inconsistentes
```sql
-- Sincronizar usuários existentes
INSERT INTO public.users (id, email, created_at)
SELECT au.id, au.email, COALESCE(au.created_at, NOW())
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL 
  AND au.deleted_at IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;
```

## 🔄 Rollback Strategy

### Se algo der errado:
1. **Rollback da aplicação** para versão anterior
2. **Rollback das migrations** se necessário:
   ```bash
   # Reverter última migration
   npx prisma migrate reset
   ```
3. **Restaurar backup** do banco se crítico

## 📈 Próximos Passos

1. **Configurar CI/CD** para automatizar deploys
2. **Implementar testes automatizados** para triggers
3. **Configurar monitoramento** de sincronização
4. **Documentar procedimentos** de emergência

## 🔗 Links Úteis

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
