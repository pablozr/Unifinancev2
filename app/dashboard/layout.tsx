import { requireAuthServer } from '@/lib/auth'
import { DashboardNavigation } from './_components/DashboardNavigation'
import AddTransactionModal from './_components/AddTransactionModal'
import DeleteTransactionModal from './_components/DeleteTransactionModal'
import ManageRecurringModal from './_components/ManageRecurringModal'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuthServer()

  return (
    <NuqsAdapter>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
        {/* Background pattern */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/20 via-gray-950/40 to-black opacity-80" />
        <div className="fixed inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <DashboardNavigation user={user} />
        <main className="lg:ml-64 relative z-10">
          {children}
        </main>
        
        {/* Modais globais */}
        <AddTransactionModal />
        <DeleteTransactionModal userId={user.id} />
        <ManageRecurringModal userId={user.id} />
        
      </div>
    </NuqsAdapter>
  )
} 