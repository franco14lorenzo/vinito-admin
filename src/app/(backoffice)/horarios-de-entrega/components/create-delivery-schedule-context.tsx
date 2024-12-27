'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

interface CreateDeliveryScheduleContextProps {
  isCreateOpen: boolean
  setIsCreateOpen: (isOpen: boolean) => void
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  isEditOpen: string
  setIsEditOpen: (isOpen: string) => void
}

const CreateDeliveryScheduleContext = createContext<
  CreateDeliveryScheduleContextProps | undefined
>(undefined)

export const CreateDeliveryScheduleProvider = ({
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
    <CreateDeliveryScheduleContext.Provider
      value={{
        isCreateOpen,
        setIsCreateOpen,
        handleOpenChange,
        isEditOpen,
        setIsEditOpen
      }}
    >
      {children}
    </CreateDeliveryScheduleContext.Provider>
  )
}

export const useCreateDeliverySchedule = () => {
  const context = useContext(CreateDeliveryScheduleContext)
  if (!context) {
    throw new Error(
      'useCreateDeliverySchedule must be used within a CreateDeliveryScheduleProvider'
    )
  }
  return context
}
