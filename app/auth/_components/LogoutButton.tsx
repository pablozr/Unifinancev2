'use client'

import logout from '../_actions/logout'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  className?: string
}

export default function LogoutButton({ className = '' }: LogoutButtonProps) {
  return (
    <form action={logout}>
      <Button type="submit" variant="danger" className={className}>
        Sair
      </Button>
    </form>
  )
} 