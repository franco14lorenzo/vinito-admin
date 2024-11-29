'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

export function CreateFAQButton() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('create', 'true')
    router.push(`?${current.toString()}`, { scroll: false })
  }

  return <Button onClick={handleClick}>Crear nueva</Button>
}
