'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
  children,
  isEditOpenParams
}: {
  children: React.ReactNode
  isEditOpenParams: string
}) {
  const [isEditOpen, setIsEditOpen] = useState(isEditOpenParams)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsEditOpen(isEditOpenParams)
  }, [isEditOpenParams])

  const handleOpenChange = (isOpen: boolean, editId?: string) => {
    setIsEditOpen(editId || '')

    const current = new URLSearchParams(Array.from(searchParams.entries()))

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

    router.push(`${pathname}?${current.toString()}`, { scroll: false })
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
