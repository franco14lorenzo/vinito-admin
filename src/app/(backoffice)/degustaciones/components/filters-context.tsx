'use client'

import React, { createContext, useContext, useState } from 'react'

import { FILTERS } from '../constants'
import { TastingStatus } from '../types'

interface FiltersContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: TastingStatus[]
  setStatusFilter: (status: TastingStatus[]) => void
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TastingStatus[]>(
    FILTERS[0].defaultSelected as TastingStatus[]
  )

  return (
    <FiltersContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter
      }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider')
  }
  return context
}
