'use client'

import { Button } from '@/components/ui/button'

import { useCreateTasting } from './create-tasting-context'

export function CreateTastingButton() {
  const { handleOpenChange } = useCreateTasting()

  const handleClick = () => {
    handleOpenChange(true)
  }

  return <Button onClick={handleClick}>Crear nueva</Button>
}
