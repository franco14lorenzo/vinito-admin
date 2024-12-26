'use client'

import { useCreateAccommodation } from '@/app/(backoffice)/alojamientos/components/create-accommodation-context'
import { Button } from '@/components/ui/button'

export function CreateAccommodationButton() {
  const { handleOpenChange } = useCreateAccommodation()

  const handleClick = () => {
    handleOpenChange(true)
  }

  return <Button onClick={handleClick}>Crear nuevo</Button>
}
