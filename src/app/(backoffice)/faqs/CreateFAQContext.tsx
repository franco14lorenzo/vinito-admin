'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { useRouter } from 'next/navigation'

interface CreateFAQContextProps {
  isCreateOpen: boolean
  setIsCreateOpen: (isOpen: boolean) => void
  handleOpenChange: (isOpen: boolean) => void
}

const CreateFAQContext = createContext<CreateFAQContextProps | undefined>(
  undefined
)

export const CreateFAQProvider = ({
  isCreateOpenParams,
  children
}: {
  isCreateOpenParams: boolean
  children: ReactNode
}) => {
  const router = useRouter()

  const [isCreateOpen, setIsCreateOpen] = useState(isCreateOpenParams)

  const handleOpenChange = (isOpen: boolean) => {
    setIsCreateOpen(isOpen)

    const searchParams = new URLSearchParams(window.location.search)
    const current = new URLSearchParams(searchParams)

    if (isOpen) {
      current.set('create', 'true')
    } else {
      current.delete('create')
    }
    router.push(`?${current.toString()}`, { scroll: false })
  }

  return (
    <CreateFAQContext.Provider
      value={{ isCreateOpen, setIsCreateOpen, handleOpenChange }}
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
