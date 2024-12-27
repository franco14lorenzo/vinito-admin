'use client'

import { useCreateDeliverySchedule } from '@/app/(backoffice)/horarios-de-entrega/components/create-delivery-schedule-context'
import { Button } from '@/components/ui/button'

export function CreateDeliveryScheduleButton() {
  const { handleOpenChange } = useCreateDeliverySchedule()

  const handleClick = () => {
    handleOpenChange(true)
  }

  return <Button onClick={handleClick}>Crear nuevo</Button>
}
