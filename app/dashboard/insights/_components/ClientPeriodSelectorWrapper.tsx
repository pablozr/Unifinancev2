'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PeriodSelector } from '@/app/dashboard/_components/PeriodSelector'
import type { PeriodFilter } from '@/app/dashboard/_data/types'

/**
 * Wrapper de cliente para o PeriodSelector.
 * Lê o estado do filtro da URL e atualiza a URL em caso de mudança.
 */
export default function ClientPeriodSelectorWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Converte os parâmetros da URL para o objeto de filtro que o seletor espera
  const getCurrentFilter = useCallback((): PeriodFilter => {
    const period = searchParams.get('period') as PeriodFilter['type'] | null
    const yearStr = searchParams.get('year')
    const monthStr = searchParams.get('month')

    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear()
    const month = monthStr ? parseInt(monthStr, 10) : undefined

    switch (period) {
      case 'monthly':
        return { type: 'monthly', year, month: month ?? new Date().getMonth() }
      case 'yearly':
        return { type: 'yearly', year }
      default:
        // Padrão para ano atual se o período for inválido ou 'all'
        return { type: 'yearly', year: new Date().getFullYear() }
    }
  }, [searchParams])
  
  const currentFilter = getCurrentFilter()

  // Atualiza a URL quando o usuário seleciona um novo período
  const handlePeriodChange = useCallback((filter: PeriodFilter) => {
    const params = new URLSearchParams()
    params.set('period', filter.type)
    if (filter.year) {
      params.set('year', filter.year.toString())
    }
    if (filter.month !== undefined) {
      params.set('month', filter.month.toString())
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router])

  return (
    <PeriodSelector 
      onPeriodChange={handlePeriodChange} 
      currentFilter={currentFilter} 
    />
  )
} 