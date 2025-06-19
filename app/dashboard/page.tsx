import { DashboardOverview } from '@/app/dashboard/components/DashboardOverview'
import { requireAuthServer } from '@/lib/auth'
import { 
  getDashboardStats, 
  getRecentTransactions,
  getCategoryData
} from './_data'

export default async function DashboardPage() {
  const user = await requireAuthServer()
  
  console.log('📊 Dashboard - Loading data for user:', user.id)
  
  const [stats, recentTransactions, categorySpending] = await Promise.all([
    getDashboardStats(user.id),
    getRecentTransactions(user.id),
    getCategoryData(user.id)
  ])

  console.log('📈 Dashboard - Stats loaded:', stats)
  console.log('📄 Dashboard - Recent transactions loaded:', recentTransactions.length)
  console.log('🥧 Dashboard - Category spending loaded:', categorySpending.length)

  return (
    <DashboardOverview 
      stats={stats}
      recentTransactions={recentTransactions}
      categorySpending={categorySpending}
      userId={user.id}
    />
  )
}
