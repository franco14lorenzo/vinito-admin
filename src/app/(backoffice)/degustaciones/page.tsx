import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

import { CreateTastingButton } from './components/create-tasting-button'
import { CreateTastingProvider } from './components/create-tasting-context'
import { CreateTastingSheet } from './components/create-tasting-sheet'
import { Filters } from './components/filters'
import { FiltersProvider } from './components/filters-context'
import { TastingList } from './components/tasting-list'
import { Tasting } from './types'

export default async function TastingsPage() {
  const tastings = await getTastings()
  const session = await auth()

  return (
    <FiltersProvider>
      <CreateTastingProvider>
        <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-2 p-4">
          <div className="flex-none space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                Degustaciones
              </h2>
              <CreateTastingButton />
            </div>
            <Filters />
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 overflow-y-auto">
              <TastingList
                tastings={tastings}
                adminId={Number(session?.user?.id)}
              />
            </div>
          </div>
          <CreateTastingSheet adminId={session?.user?.id} />
        </div>
      </CreateTastingProvider>
    </FiltersProvider>
  )
}

async function getTastings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tastings')
    .select(
      `
      *,
      tasting_wines (
        wine_id,
        wine:wines (
          id,
          name,
          winery,
          variety,
          year,
          image,
          stock,
          cost_usd_blue,
          reserved_stock
        )
      )
    `
    )
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as unknown as Tasting[]
}
