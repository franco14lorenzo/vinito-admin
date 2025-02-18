import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig = {
  active: {
    label: 'Activo',
    icon: CheckCircle2,
    variant: 'success'
  },
  draft: {
    label: 'Borrador',
    icon: Clock,
    variant: 'secondary'
  },
  inactive: {
    label: 'Inactivo',
    icon: AlertCircle,
    variant: 'warning'
  }
}

export function StatusBadge({
  status,
  className
}: {
  status: keyof typeof statusConfig
  className?: string
}) {
  const config = statusConfig[status]
  if (!config) return null
  const Icon = config.icon

  return (
    <Badge
      variant={
        config.variant as 'success' | 'warning' | 'secondary' | 'destructive'
      }
      className={cn('flex w-fit items-center gap-1', className)}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </Badge>
  )
}
