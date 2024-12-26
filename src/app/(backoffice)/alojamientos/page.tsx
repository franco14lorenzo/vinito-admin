import { PostgrestError } from '@supabase/supabase-js'

import { columns } from '@/app/(backoffice)/alojamientos/components/columns'
import { CreateAccommodationButton } from '@/app/(backoffice)/alojamientos/components/create-accommodation-button'
import { CreateAccommodationProvider } from '@/app/(backoffice)/alojamientos/components/create-accommodation-context'
import { CreateAccommodationSheet } from '@/app/(backoffice)/alojamientos/components/create-accommodation-sheet'
import { DataTable } from '@/app/(backoffice)/alojamientos/components/data-table'
import {
  DEFAULT_COLUMNS,
  DEFAULT_ORDER,
  FILTERS
} from '@/app/(backoffice)/alojamientos/constants'
import {
  Accommodation,
  AccommodationParams,
  AccommodationStatus
} from '@/app/(backoffice)/alojamientos/types'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function AccommodationsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: AccommodationParams = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    orderBy: {
      column: (awaitedSearchParams.sortBy as string) || DEFAULT_ORDER.column,
      ascending:
        awaitedSearchParams.sortOrder === undefined
          ? DEFAULT_ORDER.ascending
          : awaitedSearchParams.sortOrder !== 'desc'
    },
    filters: {
      name: awaitedSearchParams.name as string,
      address: awaitedSearchParams.address as string,
      status: awaitedSearchParams.status
        ? ((awaitedSearchParams.status as string).split(
            ','
          ) as AccommodationStatus[])
        : undefined
    },
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const { data, error, count } = await getAccommodations(
    params,
    params.visibleColumns || []
  )

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <CreateAccommodationProvider>
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Alojamientos</h2>
            <CreateAccommodationButton />
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
        <CreateAccommodationSheet adminId={session?.user?.id} />
      </div>
    </CreateAccommodationProvider>
  )
}

async function getAccommodations(
  params: AccommodationParams = {},
  visibleColumns: string[]
) {
  const {
    page = 1,
    perPage = 10,
    orderBy = DEFAULT_ORDER,
    filters = { status: FILTERS[0].defaultSelected }
  } = params

  const supabase = await createClient()

  let countQuery = supabase
    .from('accommodations')
    .select('id', { count: 'exact', head: true })

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'status' && Array.isArray(value)) {
        countQuery.in(key, value)
      } else {
        countQuery.eq(key, value)
      }
    }
  })

  if (params.search) {
    const searchCondition = `name.ilike.%${params.search}%,address.ilike.%${params.search}%`
    countQuery = countQuery.or(searchCondition)
  }

  const { count: totalRows, error: countError } = await countQuery

  if (countError) {
    return { data: [], error: countError, count: 0 }
  }

  if (!totalRows) {
    return { data: [], error: null, count: 0 }
  }

  const filteredColumns = visibleColumns.filter((col) =>
    DEFAULT_COLUMNS.includes(col)
  )

  const queryColumns = [...new Set(['id', ...filteredColumns])].join(',')

  let query = supabase.from('accommodations').select(queryColumns)

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'status' && Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    }
  })

  if (params.search) {
    const searchCondition = `name.ilike.%${params.search}%,address.ilike.%${params.search}%`
    query = query.or(searchCondition)
  }

  const from = (page - 1) * perPage
  const to = from + (perPage - 1)

  query = query
    .order(orderBy.column, {
      ascending: orderBy.ascending
    })
    .range(from, to)

  const { data, error } = (await query) as unknown as {
    data: Accommodation[]
    error: PostgrestError
  }

  return {
    data,
    error,
    count: totalRows
  }
}
