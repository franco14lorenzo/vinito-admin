'use client'

import { Button } from '@/components/ui/button'

import { useCreateFAQ } from './CreateFAQContext'

export function CreateFAQButton() {
  const { handleOpenChange } = useCreateFAQ()

  const handleClick = () => {
    handleOpenChange(true)
  }

  return <Button onClick={handleClick}>Crear nueva</Button>
}
