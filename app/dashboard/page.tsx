import { DashboardOverview } from './_components'
import { requireAuthServer } from '@/lib/auth'
import { 
  getDashboardStats, 
  getRecentTransactions,
  getCategoryData
} from './_data'

export default async function DashboardPage() {
  const user = await requireAuthServer()
  
  const [stats, recentTransactions, categorySpending] = await Promise.all([
    getDashboardStats(user.id),
    getRecentTransactions(user.id),
    getCategoryData(user.id)
  ])

  return (
    <DashboardOverview 
      stats={stats}
      recentTransactions={recentTransactions}
      categorySpending={categorySpending}
      userId={user.id}
    />
  )
}
