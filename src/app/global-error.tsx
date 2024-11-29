'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">¡Error crítico!</h2>
          <p className="text-gray-600">
            Ha ocurrido un error crítico en la aplicación.
          </p>
          <Button onClick={() => reset()} variant="outline">
            Intentar nuevamente
          </Button>
        </div>
      </body>
    </html>
  )
}
