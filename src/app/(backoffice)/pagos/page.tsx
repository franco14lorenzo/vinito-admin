import { PostgrestError } from '@supabase/supabase-js'

import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { EditPaymentProvider } from './components/edit-payment-context'
import { EditPaymentSheet } from './components/edit-payment-sheet'
import { DEFAULT_COLUMNS, DEFAULT_ORDER, FILTERS } from './constants'
import { Payment, PaymentParams, PaymentStatus } from './types'

export default async function PaymentsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: PaymentParams = {
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
        ? ((awaitedSearchParams.status as string).split(',') as PaymentStatus[])
        : undefined
    },
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const { data, error, count } = await getPayments(params)

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <EditPaymentProvider>
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Pagos</h2>
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
        <EditPaymentSheet adminId={session?.user?.id} />
      </div>
    </EditPaymentProvider>
  )
}

async function getPayments(params: PaymentParams = {}) {
  const {
    page = 1,
    perPage = 10,
    orderBy = DEFAULT_ORDER,
    filters = { status: FILTERS[0].defaultSelected }
  } = params

  const supabase = await createClient()

  let query = supabase.from('payments').select(
    `
    *,
    payment_methods (
      id,
      name
    ),
    admin_created:created_by (
      name,
      surname
    ),
    admin_updated:updated_by (
      name,
      surname
    )
  `,
    { count: 'exact' }
  )

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'status' && Array.isArray(value)) {
        query.in(key, value)
      } else {
        query.eq(key, value)
      }
    }
  })

  if (params.search) {
    const searchTerm = params.search.trim()

    const isNumber = /^\d+$/.test(searchTerm)

    if (isNumber) {
      query = query.eq('id', parseInt(searchTerm))
    }
  }

  if (filters.status) {
    query = query.in(
      'status',
      Array.isArray(filters.status) ? filters.status : [filters.status]
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
    data: Payment[]
    error: PostgrestError
    count: number
  }

  return {
    data,
    error,
    count
  }
}
