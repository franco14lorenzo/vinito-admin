'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

interface CreateWineContextProps {
  isCreateOpen: boolean
  setIsCreateOpen: (isOpen: boolean) => void
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  isEditOpen: string
  setIsEditOpen: (isOpen: string) => void
}

const CreateWineContext = createContext<CreateWineContextProps | undefined>(
  undefined
)

export const CreateWineProvider = ({ children }: { children: ReactNode }) => {
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
    <CreateWineContext.Provider
      value={{
        isCreateOpen,
        setIsCreateOpen,
        handleOpenChange,
        isEditOpen,
        setIsEditOpen
      }}
    >
      {children}
    </CreateWineContext.Provider>
  )
}

export const useCreateWine = () => {
  const context = useContext(CreateWineContext)
  if (!context) {
    throw new Error('useCreateWine must be used within a CreateWineProvider')
  }
  return context
}
