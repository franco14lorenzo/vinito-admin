import { PostgrestError } from '@supabase/supabase-js'

import { columns } from '@/app/(backoffice)/ordenes/components/columns'
import {
  DEFAULT_COLUMNS,
  DEFAULT_ORDER,
  FILTERS
} from '@/app/(backoffice)/ordenes/constants'
import {
  Order,
  OrderParams,
  OrderStatus
} from '@/app/(backoffice)/ordenes/types'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

import { DataTable } from './components/data-table'

export default async function OrdersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: OrderParams = {
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
      status: awaitedSearchParams.status
        ? ((awaitedSearchParams.status as string).split(',') as OrderStatus[])
        : undefined,
      delivery_date: awaitedSearchParams.delivery_date as string,
      customer_id: awaitedSearchParams.customer_id as string,
      delivery_schedule_id: awaitedSearchParams.delivery_schedule_id
        ? Number(awaitedSearchParams.delivery_schedule_id)
        : undefined
    },
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const { data, error, count } = await getOrders(params)

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
      <div className="flex-none">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Órdenes</h2>
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
    </div>
  )
}

async function getOrders(params: OrderParams = {}) {
  const {
    page = 1,
    perPage = 10,
    orderBy = DEFAULT_ORDER,
    filters = { status: FILTERS[0].defaultSelected }
  } = params

  const supabase = await createClient()

  let query = supabase.from('orders').select(
    `
      *,
      customer:customers(id, name, surname, email, phone),
      accommodation:accommodations(id, name, address, latitude, longitude),
      delivery_schedule:delivery_schedules(name, start_time, end_time),
      payments!payments_order_id_fkey(
        id,
        payment_method_id,
        amount,
        status,
        payment_method:payment_methods(
          id,
          name,
          description,
          type
        )
      ),
      order_tastings!order_tastings_order_id_fkey(
        quantity,
        tasting:tastings(
          id,
          name,
          image
        )
      ),
      created_by_admin:admin!orders_created_by_fkey(
        id,
        name,
        surname
      ),
      updated_by_admin:admin!orders_updated_by_fkey(
        id,
        name,
        surname
      )
    `,
    { count: 'exact' }
  )

  if (filters.status && Array.isArray(filters.status)) {
    query = query.in('status', filters.status)
  }

  if ('delivery_date' in filters && filters.delivery_date) {
    query = query.eq('delivery_date', filters.delivery_date)
  }

  if ('customer_id' in filters && filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  if ('delivery_schedule_id' in filters && filters.delivery_schedule_id) {
    query = query.eq('delivery_schedule_id', filters.delivery_schedule_id)
  }

  if (params.search) {
    const searchTerm = params.search.trim()

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        searchTerm
      )

    if (isUUID) {
      query = query.eq('id', searchTerm)
    }
  }

  const from = (page - 1) * perPage
  const to = from + (perPage - 1)

  const orderColumn =
    orderBy.column === 'delivery' ? 'delivery_date' : orderBy.column

  query = query
    .order(orderColumn, {
      ascending: orderBy.ascending,
      nullsFirst: false
    })
    .range(from, to)

  const { data, error, count } = await query

  return {
    data: data as unknown as Order[],
    error: error as PostgrestError,
    count
  }
}
