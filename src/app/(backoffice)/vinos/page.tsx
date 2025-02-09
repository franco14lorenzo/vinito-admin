import { PostgrestError } from '@supabase/supabase-js'

import { columns } from '@/app/(backoffice)/vinos/components/columns'
import { CreateWineButton } from '@/app/(backoffice)/vinos/components/create-wine-button'
import { CreateWineProvider } from '@/app/(backoffice)/vinos/components/create-wine-context'
import { CreateWineSheet } from '@/app/(backoffice)/vinos/components/create-wine-sheet'
import { DataTable } from '@/app/(backoffice)/vinos/components/data-table'
import {
  DEFAULT_COLUMNS,
  DEFAULT_ORDER,
  FILTERS,
  REQUIRED_COLUMNS
} from '@/app/(backoffice)/vinos/constants'
import { Wine, WineParams, WineStatus } from '@/app/(backoffice)/vinos/types'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function WinesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: WineParams = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    orderBy: {
      column:
        (awaitedSearchParams.sortBy as string) ||
        (DEFAULT_ORDER.column as string),
      ascending: awaitedSearchParams.sortOrder
        ? awaitedSearchParams.sortOrder !== 'desc'
        : DEFAULT_ORDER.ascending
    },
    filters: {
      name: awaitedSearchParams.name as string,
      winery: awaitedSearchParams.winery as string,
      year: awaitedSearchParams.year
        ? Number(awaitedSearchParams.year)
        : undefined,
      status: awaitedSearchParams.status
        ? ((awaitedSearchParams.status as string).split(',') as WineStatus[])
        : undefined
    },
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const { data, error, count } = await getWines(params)

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <CreateWineProvider>
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Vinos</h2>
            <CreateWineButton />
          </div>
        </div>
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0 overflow-y-auto">
            <DataTable
              adminId={session?.user?.id as string}
              columns={columns}
              data={data || []}
              pageCount={pageCount}
              totalRecords={count || 0}
            />
          </div>
        </div>
        <CreateWineSheet adminId={session?.user?.id} />
      </div>
    </CreateWineProvider>
  )
}

async function getWines(params: WineParams = {}) {
  const {
    page = 1,
    perPage = 10,
    orderBy = DEFAULT_ORDER,
    filters = { status: FILTERS[0].defaultSelected, year: undefined }
  } = params

  const supabase = await createClient()

  let countQuery = supabase
    .from('wines')
    .select('id', { count: 'exact', head: true })

  const { year: yearFilter, ...otherFilters } = filters
  if (yearFilter !== undefined) {
    countQuery.eq('year', yearFilter)
  }

  Object.entries(otherFilters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'status' && Array.isArray(value)) {
        countQuery.in(key, value)
      } else {
        countQuery.eq(key, value)
      }
    }
  })

  if (params.search) {
    const searchInt = parseInt(params.search, 10)
    const searchCondition = `name.ilike.%${params.search}%,winery.ilike.%${params.search}%`
    if (!isNaN(searchInt)) {
      countQuery = countQuery.or(`${searchCondition},year.eq.${searchInt}`)
    } else {
      countQuery = countQuery.or(searchCondition)
    }
  }

  const { count: totalRows, error: countError } = await countQuery

  if (countError) {
    return { data: [], error: countError, count: 0 }
  }

  if (!totalRows) {
    return { data: [], error: null, count: 0 }
  }

  let query = supabase.from('wines').select(REQUIRED_COLUMNS.join(','))

  if (filters.year !== undefined) {
    query = query.eq('year', filters.year)
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && key !== 'year') {
      if (key === 'status' && Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    }
  })

  if (params.search) {
    const searchInt = parseInt(params.search, 10)
    const searchCondition = `name.ilike.%${params.search}%,winery.ilike.%${params.search}%`
    if (!isNaN(searchInt)) {
      query = query.or(`${searchCondition},year.eq.${searchInt}`)
    } else {
      query = query.or(searchCondition)
    }
  }

  const from = (page - 1) * perPage
  const to = from + (perPage - 1)

  query = query
    .order(orderBy.column, {
      ascending: orderBy.ascending,
      nullsFirst: false
    })
    .range(from, to)

  const { data, error } = (await query) as unknown as {
    data: Wine[]
    error: PostgrestError
  }

  return {
    data,
    error,
    count: totalRows
  }
}
