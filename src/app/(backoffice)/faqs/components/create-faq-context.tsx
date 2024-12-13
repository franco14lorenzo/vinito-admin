'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

interface CreateFAQContextProps {
  isCreateOpen: boolean
  setIsCreateOpen: (isOpen: boolean) => void
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  isEditOpen: string
  setIsEditOpen: (isOpen: string) => void
}

const CreateFAQContext = createContext<CreateFAQContextProps | undefined>(
  undefined
)

export const CreateFAQProvider = ({ children }: { children: ReactNode }) => {
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
    <CreateFAQContext.Provider
      value={{
        isCreateOpen,
        setIsCreateOpen,
        handleOpenChange,
        isEditOpen,
        setIsEditOpen
      }}
    >
      {children}
    </CreateFAQContext.Provider>
  )
}

export const useCreateFAQ = () => {
  const context = useContext(CreateFAQContext)
  if (!context) {
    throw new Error('useCreateFAQ must be used within a CreateFAQProvider')
  }
  return context
}
