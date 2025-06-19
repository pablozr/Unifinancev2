'use client'

import logout from '@/app/auth/_actions/logout'
import { Button } from '@/components/ui/button'

export function LogoutButton({ className = '' }: { className?: string }) {
  return (
    <form action={logout}>
      <Button type="submit" variant="danger" className={className}>
        Sair
      </Button>
    </form>
  )
}
