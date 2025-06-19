import { createClient } from '@/lib/supabase/server'

/**
 * Script para testar sincronização de usuários entre auth.users e public.users
 */

async function testUserSync() {
  console.log('🔄 Iniciando teste de sincronização de usuário...')
  
  try {
    const supabase = await createClient()

    // Buscar usuários do schema auth
    console.log('📊 Buscando usuários do auth...')
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .limit(10)

    if (authError) {
      console.error('❌ Erro ao buscar usuários do auth:', authError)
      return
    }

    console.log(`✅ Encontrados ${authUsers?.length || 0} usuários no auth`)

    // Buscar usuários do schema public  
    console.log('📊 Buscando usuários do public...')
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .limit(10)

    if (publicError) {
      console.error('❌ Erro ao buscar usuários do public:', publicError)
      return
    }

    console.log(`✅ Encontrados ${publicUsers?.length || 0} usuários no public`)

    // Verificar usuários sincronizados
    console.log('🔍 Verificando usuários sincronizados...')
    
    if (authUsers && publicUsers) {
      const authIds = new Set(authUsers.map(u => u.id))
      const publicIds = new Set(publicUsers.map(u => u.id))

      const syncedUsers = authUsers.filter((u: any) => publicIds.has(u.id))
      const orphanAuthUsers = authUsers.filter((u: any) => !publicIds.has(u.id))
      const orphanPublicUsers = publicUsers.filter((u: any) => !authIds.has(u.id))

      console.log(`✅ Usuários sincronizados: ${syncedUsers.length}`)
      console.log(`⚠️  Usuários órfãos no auth: ${orphanAuthUsers.length}`)
      console.log(`⚠️  Usuários órfãos no public: ${orphanPublicUsers.length}`)

      if (orphanAuthUsers.length > 0) {
        console.log('🔍 Usuários órfãos no auth:')
        orphanAuthUsers.forEach((user: any) => {
          console.log(`   - ${user.email} (${user.id})`)
        })
      }

      if (orphanPublicUsers.length > 0) {
        console.log('🔍 Usuários órfãos no public:')
        orphanPublicUsers.forEach((user: any) => {
          console.log(`   - ${user.email} (${user.id})`)
        })
      }
    }

    // Verificar integridade dos dados
    console.log('🔍 Verificando integridade dos dados...')
    
    const { count: transactionCount, error: transactionError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    if (transactionError) {
      console.error('❌ Erro ao contar transações:', transactionError)
    } else {
      console.log(`📊 Total de transações: ${transactionCount}`)
    }

    const { count: categoryCount, error: categoryError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    if (categoryError) {
      console.error('❌ Erro ao contar categorias:', categoryError)
    } else {
      console.log(`📊 Total de categorias: ${categoryCount}`)
    }

    console.log('✅ Teste de sincronização concluído!')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    process.exit(0)
  }
}

// Executar o teste
testUserSync().catch(error => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})
