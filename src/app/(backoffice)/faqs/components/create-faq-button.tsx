'use client'

import { useCreateFAQ } from '@/app/(backoffice)/faqs/components/create-faq-context'
import { Button } from '@/components/ui/button'

export function CreateFAQButton() {
  const { handleOpenChange } = useCreateFAQ()

  const handleClick = () => {
    handleOpenChange(true)
  }

  return <Button onClick={handleClick}>Crear nueva</Button>
}
