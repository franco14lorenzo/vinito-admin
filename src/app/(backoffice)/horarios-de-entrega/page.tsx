import { PostgrestError } from '@supabase/supabase-js'

import { columns } from '@/app/(backoffice)/horarios-de-entrega/components/columns'
import { CreateDeliveryScheduleButton } from '@/app/(backoffice)/horarios-de-entrega/components/create-delivery-schedule-button'
import { CreateDeliveryScheduleProvider } from '@/app/(backoffice)/horarios-de-entrega/components/create-delivery-schedule-context'
import { CreateDeliveryScheduleSheet } from '@/app/(backoffice)/horarios-de-entrega/components/create-delivery-schedule-sheet'
import { DataTable } from '@/app/(backoffice)/horarios-de-entrega/components/data-table'
import {
  DEFAULT_COLUMNS,
  DEFAULT_ORDER,
  FILTERS
} from '@/app/(backoffice)/horarios-de-entrega/constants'
import {
  DeliverySchedule,
  DeliveryScheduleParams,
  DeliveryScheduleStatus
} from '@/app/(backoffice)/horarios-de-entrega/types'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function DeliverySchedulesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: DeliveryScheduleParams = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    orderBy: {
      column: (awaitedSearchParams.sortBy as string) || 'name',
      ascending: awaitedSearchParams.sortOrder !== 'desc'
    },
    filters: {
      name: awaitedSearchParams.name as string,
      status: awaitedSearchParams.status
        ? ((awaitedSearchParams.status as string).split(
            ','
          ) as DeliveryScheduleStatus[])
        : undefined
    },
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const { data, error, count } = await getDeliverySchedules(
    params,
    params.visibleColumns || []
  )

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <CreateDeliveryScheduleProvider>
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Horarios de Entrega
            </h2>
            <CreateDeliveryScheduleButton />
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
        <CreateDeliveryScheduleSheet adminId={session?.user?.id} />
      </div>
    </CreateDeliveryScheduleProvider>
  )
}

async function getDeliverySchedules(
  params: DeliveryScheduleParams = {},
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
    .from('delivery_schedules')
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
    const searchCondition = `name.ilike.%${params.search}%`
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

  let query = supabase.from('delivery_schedules').select(queryColumns)

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
    const searchCondition = `name.ilike.%${params.search}%`
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
    data: DeliverySchedule[]
    error: PostgrestError
  }

  return {
    data,
    error,
    count: totalRows
  }
}
