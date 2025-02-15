import { PostgrestError } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { DEFAULT_COLUMNS, DEFAULT_ORDER } from './constants'
import {
  StockMovementParams,
  StockMovementType,
  WineStockMovement
} from './types'

export default async function StockMovementsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: StockMovementParams = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : [...DEFAULT_COLUMNS],
    search: (awaitedSearchParams.search as string) || '',
    orderBy: {
      column: (awaitedSearchParams.sortBy as string) || DEFAULT_ORDER.column,
      ascending:
        awaitedSearchParams.sortOrder === undefined
          ? DEFAULT_ORDER.ascending
          : awaitedSearchParams.sortOrder !== 'desc'
    },
    filters: {
      type: awaitedSearchParams.type
        ? ((awaitedSearchParams.type as string).split(
            ','
          ) as StockMovementType[])
        : undefined
    }
  }

  const { data, error, count } = await getStockMovements(params)

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / params.perPage!) : 0

  return (
    <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
      <div className="flex-none">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Movimientos de Stock
          </h2>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 overflow-y-auto">
          <DataTable
            columns={columns}
            data={data || []}
            pageCount={pageCount}
            totalRecords={count || 0}
          />
        </div>
      </div>
    </div>
  )
}

async function getStockMovements(params: StockMovementParams = {}) {
  const supabase = await createClient()
  const {
    page = 1,
    perPage = 10,
    orderBy = DEFAULT_ORDER,
    filters = {}
  } = params

  let query = supabase
    .from('wine_stock_movements')
    .select(
      '*, wine:wines(name), created_by:admin!wine_stock_movements_created_by_fkey(name, surname)',
      {
        count: 'exact'
      }
    )

  if (params.search) {
    query = query.textSearch('notes', params.search)
  }

  if (filters.type) {
    query = query.in(
      'type',
      Array.isArray(filters.type) ? filters.type : [filters.type]
    )
  }

  const from = (page - 1) * perPage
  const to = from + (perPage - 1)

  query = query
    .order(orderBy.column, {
      ascending: orderBy.ascending
    })
    .range(from, to)

  const { data, error, count } = (await query) as unknown as {
    data: WineStockMovement[]
    error: PostgrestError | null
    count: number
  }
  return { data, error, count }
}
