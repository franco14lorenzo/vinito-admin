'use client'

import { createContext, useContext, useState } from 'react'

interface CreateAccommodationContextType {
  isCreateOpen: boolean
  isEditOpen: string | false
  handleOpenChange: (open: boolean, id?: string) => void
}

const CreateAccommodationContext = createContext<
  CreateAccommodationContextType | undefined
>(undefined)

export function CreateAccommodationProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState<string | false>(false)

  const handleOpenChange = (open: boolean, id?: string) => {
    if (!open) {
      setIsCreateOpen(false)
      setIsEditOpen(false)
      return
    }

    if (id) {
      setIsEditOpen(id)
      setIsCreateOpen(true)
    } else {
      setIsCreateOpen(true)
      setIsEditOpen(false)
    }
  }

  return (
    <CreateAccommodationContext.Provider
      value={{ isCreateOpen, isEditOpen, handleOpenChange }}
    >
      {children}
    </CreateAccommodationContext.Provider>
  )
}

export function useCreateAccommodation() {
  const context = useContext(CreateAccommodationContext)
  if (!context) {
    throw new Error(
      'useCreateAccommodation must be used within a CreateAccommodationProvider'
    )
  }
  return context
}
