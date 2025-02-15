'use client'

import { createContext, useContext, useState } from 'react'

interface CreateStockMovementContextData {
  isCreateOpen: boolean
  handleOpenChange: (isOpen: boolean) => void
}

const CreateStockMovementContext =
  createContext<CreateStockMovementContextData>({
    isCreateOpen: false,
    handleOpenChange: () => {}
  })

export function CreateStockMovementProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setIsCreateOpen(isOpen)
  }

  return (
    <CreateStockMovementContext.Provider
      value={{
        isCreateOpen,
        handleOpenChange
      }}
    >
      {children}
    </CreateStockMovementContext.Provider>
  )
}

export const useCreateStockMovement = () =>
  useContext(CreateStockMovementContext)
