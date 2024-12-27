'use client'

import { useCreateCustomer } from '@/app/(backoffice)/listado-de-clientes/components/create-customer-context'
import { Button } from '@/components/ui/button'

export function CreateCustomerButton() {
  const { handleOpenChange } = useCreateCustomer()

  const handleClick = () => {
    handleOpenChange(true)
  }

  return <Button onClick={handleClick}>Crear nuevo</Button>
}
