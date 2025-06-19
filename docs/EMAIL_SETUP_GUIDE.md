# 📧 Guia de Configuração de Email - Supabase

## 🚨 **Problema: Email de Reset Não Está Sendo Enviado**

### **Causa Mais Comum:**
O Supabase por padrão **NÃO** envia emails em desenvolvimento. É necessário configurar um provedor de email.

## 🔧 **Soluções (em ordem de facilidade)**

### **1. 🎯 SOLUÇÃO RÁPIDA: Usar Email Provider Gratuito**

#### **Opção A: Gmail (Recomendado para desenvolvimento)**
```bash
# 1. Acesse o Supabase Dashboard
https://supabase.com/dashboard

# 2. Vá para seu projeto > Authentication > Settings

# 3. Configure SMTP Settings:
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Pass: sua-senha-de-app (não a senha normal!)

# 4. Como gerar senha de app no Gmail:
1. Vá para myaccount.google.com
2. Security > 2-Step Verification
3. App passwords > Generate
4. Use essa senha no Supabase
```

#### **Opção B: Resend (Recomendado para produção)**
```bash
# 1. Crie conta gratuita em resend.com
# 2. Gere API Key
# 3. Configure no Supabase:
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Pass: sua-api-key-do-resend
```

### **2. 🛠️ CONFIGURAÇÃO NO SUPABASE DASHBOARD**

#### **Passo a Passo:**
```
1. 🌐 Acesse: https://supabase.com/dashboard
2. 📁 Selecione seu projeto
3. 🔐 Authentication > Settings
4. 📧 SMTP Settings
5. ✅ Enable custom SMTP
6. 📝 Preencha os dados do provedor
7. 💾 Save
8. 🧪 Test connection
```

#### **Configurações Importantes:**
```yaml
# Email Templates (opcional)
- Confirm signup: Personalizar template
- Reset password: Personalizar template
- Magic link: Personalizar template

# Site URL (obrigatório)
Site URL: http://localhost:3000
Additional redirect URLs: 
  - http://localhost:3000/auth/callback
  - http://localhost:3000/reset-password
```

### **3. 🔍 VERIFICAÇÃO E DEBUG**

#### **Como Testar se Está Funcionando:**
```typescript
// Adicione logs na Server Action
console.log('🔄 Enviando email para:', email)
console.log('📧 Resposta:', { data, error })

// Se error for null, email foi enviado
// Se error existir, veja a mensagem específica
```

#### **Erros Comuns e Soluções:**
```bash
# ❌ "SMTP not configured"
✅ Solução: Configure SMTP no dashboard

# ❌ "Invalid credentials"
✅ Solução: Verifique usuário/senha do email

# ❌ "Rate limit exceeded"
✅ Solução: Aguarde 1 minuto entre tentativas

# ❌ "Email not confirmed"
✅ Solução: Email provider precisa ser verificado
```

### **4. 🚀 ALTERNATIVA: Desenvolvimento Sem Email**

#### **Para Testar Localmente (Bypass Email):**
```typescript
// Opção 1: Usar Magic Link no console
// O Supabase mostra o link no console quando SMTP não está configurado

// Opção 2: Criar usuário direto no dashboard
// Supabase Dashboard > Authentication > Users > Add user

// Opção 3: Usar signUp sem confirmação
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    emailRedirectTo: undefined // Remove confirmação
  }
})
```

## ✅ **Verificação Final**

### **Checklist de Configuração:**
- [ ] ✅ SMTP configurado no Supabase Dashboard
- [ ] ✅ Site URL configurado corretamente
- [ ] ✅ Redirect URLs incluem /reset-password
- [ ] ✅ Email provider testado e funcionando
- [ ] ✅ Variável NEXT_PUBLIC_SITE_URL no .env
- [ ] ✅ Pasta de spam verificada

### **Como Confirmar que Funciona:**
```bash
# 1. Teste forgot password
# 2. Verifique logs do servidor
# 3. Verifique email (incluindo spam)
# 4. Clique no link recebido
# 5. Deve abrir /reset-password
```

## 🎯 **Resumo da Segurança**

### **Por que é Seguro Mesmo Sem Verificar "Propriedade":**
1. **Token único**: Impossível de adivinhar
2. **Expira em 1 hora**: Janela limitada
3. **Uso único**: Não pode ser reutilizado
4. **Enviado apenas para email cadastrado**: Prova de acesso
5. **Rate limiting**: Proteção contra spam
6. **Não revela se email existe**: Proteção de privacidade

### **Mesmo Sistema Usado Por:**
- 🏦 Bancos (Itaú, Nubank, Inter)
- 🌐 Big Tech (Google, Microsoft, Apple)
- 📱 Apps (WhatsApp, Instagram, Spotify)
- 💼 Empresas (Slack, GitHub, Notion)

**O sistema é seguro e segue padrões da indústria!** 🔒

## 🆘 **Se Ainda Não Funcionar**

### **Debug Avançado:**
```typescript
// Adicione na Server Action:
console.log('Environment:', {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NODE_ENV: process.env.NODE_ENV
})

// Verifique se o Supabase está configurado:
console.log('Supabase config:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + '...'
})
```

### **Contato para Suporte:**
- 📧 Supabase Support: support@supabase.io
- 📚 Documentação: https://supabase.com/docs/guides/auth
- 💬 Discord: https://discord.supabase.com
