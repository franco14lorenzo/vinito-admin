'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

interface CreateCustomerContextProps {
  isCreateOpen: boolean
  setIsCreateOpen: (isOpen: boolean) => void
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  isEditOpen: string
  setIsEditOpen: (isOpen: string) => void
}

const CreateCustomerContext = createContext<
  CreateCustomerContextProps | undefined
>(undefined)

export const CreateCustomerProvider = ({
  children
}: {
  children: ReactNode
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState('')

  const handleOpenChange = (isOpen: boolean, editId?: string) => {
    if (!isOpen) {
      setIsCreateOpen(false)
      setIsEditOpen('')
      return
    }

    if (editId) {
      setIsEditOpen(editId)
      setIsCreateOpen(false)
    } else {
      setIsCreateOpen(true)
      setIsEditOpen('')
    }
  }

  return (
    <CreateCustomerContext.Provider
      value={{
        isCreateOpen,
        setIsCreateOpen,
        handleOpenChange,
        isEditOpen,
        setIsEditOpen
      }}
    >
      {children}
    </CreateCustomerContext.Provider>
  )
}

export const useCreateCustomer = () => {
  const context = useContext(CreateCustomerContext)
  if (!context) {
    throw new Error(
      'useCreateCustomer must be used within a CreateCustomerProvider'
    )
  }
  return context
}
