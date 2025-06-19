interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
}

export function Alert({ type = 'error', children }: AlertProps) {
  const styles = {
    success: 'bg-green-600/20 border-green-500/30 text-green-400',
    error: 'bg-red-600/20 border-red-500/30 text-red-400',
    warning: 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-600/20 border-blue-500/30 text-blue-400'
  }

  return (
    <div className={`border rounded-xl p-4 ${styles[type]}`}>
      <div className="text-sm">{children}</div>
    </div>
  )
}
