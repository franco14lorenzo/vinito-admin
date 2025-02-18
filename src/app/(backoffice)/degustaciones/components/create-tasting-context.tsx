'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

interface CreateTastingContextProps {
  isCreateOpen: boolean
  setIsCreateOpen: (isOpen: boolean) => void
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  isEditOpen: string
  setIsEditOpen: (isOpen: string) => void
}

const CreateTastingContext = createContext<
  CreateTastingContextProps | undefined
>(undefined)

export const CreateTastingProvider = ({
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
    } else {
      setIsCreateOpen(true)
      setIsEditOpen(editId || '')
    }
  }

  return (
    <CreateTastingContext.Provider
      value={{
        isCreateOpen,
        setIsCreateOpen,
        handleOpenChange,
        isEditOpen,
        setIsEditOpen
      }}
    >
      {children}
    </CreateTastingContext.Provider>
  )
}

export const useCreateTasting = () => {
  const context = useContext(CreateTastingContext)
  if (!context) {
    throw new Error(
      'useCreateTasting must be used within a CreateTastingProvider'
    )
  }
  return context
}
