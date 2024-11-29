'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">¡Algo salió mal!</h2>
      <p className="text-gray-600">Ha ocurrido un error inesperado.</p>
      <Button onClick={() => reset()} variant="outline">
        Intentar nuevamente
      </Button>
    </div>
  )
}
