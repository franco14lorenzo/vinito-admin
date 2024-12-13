import { PostgrestError } from '@supabase/supabase-js'

import { columns } from '@/app/(backoffice)/metodos-de-pago/components/columns'
import { DataTable } from '@/app/(backoffice)/metodos-de-pago/components/data-table'
import { EditPaymentMethodProvider } from '@/app/(backoffice)/metodos-de-pago/components/edit-payment-method-context'
import { EditPaymentMethodSheet } from '@/app/(backoffice)/metodos-de-pago/components/edit-payment-method-sheet'
import {
  DEFAULT_COLUMNS,
  DEFAULT_ORDER,
  FILTERS
} from '@/app/(backoffice)/metodos-de-pago/constants'
import {
  PaymentMethod,
  PaymentMethodParams,
  PaymentMethodStatus
} from '@/app/(backoffice)/metodos-de-pago/types'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function PaymentMethodsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: PaymentMethodParams = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || '',
    orderBy: {
      column: (awaitedSearchParams.sortBy as string) || 'updated_at',
      ascending: awaitedSearchParams.sortOrder !== 'desc'
    },
    filters: {
      status: awaitedSearchParams.status
        ? ((awaitedSearchParams.status as string).split(
            ','
          ) as PaymentMethodStatus[])
        : undefined
    }
  }

  const { data, error, count } = await getPaymentMethods(
    params,
    params.visibleColumns || []
  )

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <EditPaymentMethodProvider>
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Métodos de pago
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
        <EditPaymentMethodSheet adminId={session?.user?.id} />
      </div>
    </EditPaymentMethodProvider>
  )
}

async function getPaymentMethods(
  params: PaymentMethodParams = {},
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
    .from('payment_methods')
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
    countQuery = countQuery.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
    )
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

  let query = supabase.from('payment_methods').select(queryColumns)

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
    )
  }

  const from = (page - 1) * perPage
  const to = from + (perPage - 1)

  query = query
    .order(orderBy.column, {
      ascending: orderBy.ascending
    })
    .range(from, to)

  const { data, error } = (await query) as unknown as {
    data: PaymentMethod[]
    error: PostgrestError
  }

  return {
    data,
    error,
    count: totalRows
  }
}
