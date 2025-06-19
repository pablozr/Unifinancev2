import { AdvancedInsightsDashboard } from './components/AdvancedInsightsDashboard'
import { requireAuthServer } from '@/lib/auth'

export default async function InsightsPage() {
  const user = await requireAuthServer()

  return (
    <AdvancedInsightsDashboard userId={user.id} />
  )
} 