'use client'

import { createContext, useContext, useState } from 'react'

interface CreateSettingContextData {
  isEditOpen: string
  handleOpenChange: (isOpen: boolean, editId?: string) => void
  setIsEditOpen: (isOpen: string) => void
}

const CreateSettingContext = createContext<CreateSettingContextData>({
  isEditOpen: '',
  handleOpenChange: () => {},
  setIsEditOpen: () => {}
})

export function EditSettingProvider({
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
    <CreateSettingContext.Provider
      value={{
        isEditOpen,
        setIsEditOpen,
        handleOpenChange
      }}
    >
      {children}
    </CreateSettingContext.Provider>
  )
}

export const useCreateSetting = () => useContext(CreateSettingContext)
