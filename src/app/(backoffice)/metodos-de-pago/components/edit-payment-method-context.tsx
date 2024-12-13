'use client'

import { createContext, useContext, useState } from 'react'

interface EditPaymentMethodContextData {
  isEditOpen: string
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  setIsEditOpen: (isOpen: string) => void
}

const EditPaymentMethodContext = createContext<EditPaymentMethodContextData>({
  isEditOpen: '',
  handleOpenChange: () => {},
  setIsEditOpen: () => {}
})

export function EditPaymentMethodProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isEditOpen, setIsEditOpen] = useState('')

  const handleOpenChange = (isOpen: boolean, editId?: string) => {
    if (!isOpen) {
      setIsEditOpen('')
      return
    }

    if (editId) {
      setIsEditOpen(editId)
    } else {
      setIsEditOpen('')
    }
  }

  return (
    <EditPaymentMethodContext.Provider
      value={{
        isEditOpen,
        setIsEditOpen,
        handleOpenChange
      }}
    >
      {children}
    </EditPaymentMethodContext.Provider>
  )
}

export const useEditPaymentMethod = () => useContext(EditPaymentMethodContext)
