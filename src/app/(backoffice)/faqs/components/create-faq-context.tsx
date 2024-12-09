'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { useRouter } from 'next/navigation'

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

export const CreateFAQProvider = ({
  isCreateOpenParams,
  isEditOpenParams,
  children
}: {
  isCreateOpenParams: boolean
  isEditOpenParams: string
  children: ReactNode
}) => {
  const router = useRouter()

  const [isCreateOpen, setIsCreateOpen] = useState(isCreateOpenParams)
  const [isEditOpen, setIsEditOpen] = useState(isEditOpenParams)

  const handleOpenChange = (isOpen: boolean, editId?: string) => {
    setIsCreateOpen(isOpen)
    setIsEditOpen(editId || '')

    const searchParams = new URLSearchParams(window.location.search)
    const current = new URLSearchParams(searchParams)

    if (isOpen) {
      if (editId) {
        current.set('edit', editId)
      } else {
        current.set('create', 'true')
      }
    } else {
      current.delete('create')
      current.delete('edit')
    }
    router.push(`?${current.toString()}`, { scroll: false })
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
