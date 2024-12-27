import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

export const Spinner = ({
  className,
  size = 24,
  ...props
}: {
  className?: string
  size?: number
}) => {
  return (
    <>
      <LoaderCircle
        className={cn('animate-spin', className)}
        size={size}
        {...props}
      />
      <span className="sr-only">Cargando...</span>
    </>
  )
}
