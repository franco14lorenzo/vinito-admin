'use client'

import { useCreateWine } from '@/app/(backoffice)/vinos/components/create-wine-context'
import { Button } from '@/components/ui/button'

export function CreateWineButton() {
  const { handleOpenChange } = useCreateWine()

  const handleClick = () => {
    handleOpenChange(true)
  }

  return <Button onClick={handleClick}>Crear nuevo</Button>
}
