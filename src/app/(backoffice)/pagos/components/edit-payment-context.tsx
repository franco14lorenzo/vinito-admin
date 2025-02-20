'use client'

import { createContext, useContext, useState } from 'react'

interface EditPaymentContextData {
  isEditOpen: string
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  setIsEditOpen: (isOpen: string) => void
}

const EditPaymentContext = createContext<EditPaymentContextData>({
  isEditOpen: '',
  handleOpenChange: () => {},
  setIsEditOpen: () => {}
})

export function EditPaymentProvider({
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
    <EditPaymentContext.Provider
      value={{
        isEditOpen,
        setIsEditOpen,
        handleOpenChange
      }}
    >
      {children}
    </EditPaymentContext.Provider>
  )
}

export const useEditPayment = () => useContext(EditPaymentContext)
