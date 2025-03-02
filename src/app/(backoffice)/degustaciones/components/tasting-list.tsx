'use client'

import { Tasting } from '../types'

import { useFilters } from './filters-context'
import { TastingCard } from './tasting-card'

interface TastingListProps {
  tastings: Tasting[]
  adminId: number
}

export function TastingList({ tastings, adminId }: TastingListProps) {
  const { searchTerm, statusFilter } = useFilters()

  const filteredTastings = tastings.filter((tasting) => {
    const isID = /^\d+$/.test(searchTerm)
    const matchesSearch = isID
      ? tasting.id === Number(searchTerm)
      : tasting.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(tasting.status)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-2xl bg-gray-50 p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {filteredTastings.length ? (
          filteredTastings.map((tasting) => (
            <TastingCard key={tasting.id} tasting={tasting} adminId={adminId} />
          ))
        ) : (
          <div className="col-span-full flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              No se encontraron degustaciones
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
