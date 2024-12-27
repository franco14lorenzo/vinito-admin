import { PostgrestError } from '@supabase/supabase-js'

import { columns } from '@/app/(backoffice)/listado-de-clientes/components/columns'
import { CreateCustomerButton } from '@/app/(backoffice)/listado-de-clientes/components/create-customer-button'
import { CreateCustomerProvider } from '@/app/(backoffice)/listado-de-clientes/components/create-customer-context'
import { CreateCustomerSheet } from '@/app/(backoffice)/listado-de-clientes/components/create-customer-sheet'
import { DataTable } from '@/app/(backoffice)/listado-de-clientes/components/data-table'
import {
  DEFAULT_COLUMNS,
  DEFAULT_ORDER
} from '@/app/(backoffice)/listado-de-clientes/constants'
import {
  Customer,
  CustomerParams
} from '@/app/(backoffice)/listado-de-clientes/types'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: CustomerParams = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    orderBy: {
      column: (awaitedSearchParams.sortBy as string) || 'created_at',
      ascending: awaitedSearchParams.sortOrder !== 'desc'
    },
    filters: {
      name: awaitedSearchParams.name as string,
      surname: awaitedSearchParams.surname as string,
      email: awaitedSearchParams.email as string,
      phone: awaitedSearchParams.phone as string
    },
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const { data, error, count } = await getCustomers(
    params,
    params.visibleColumns || []
  )

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <CreateCustomerProvider>
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
            <CreateCustomerButton />
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
        <CreateCustomerSheet adminId={session?.user?.id} />
      </div>
    </CreateCustomerProvider>
  )
}

async function getCustomers(
  params: CustomerParams = {},
  visibleColumns: string[]
) {
  const {
    page = 1,
    perPage = 10,
    orderBy = DEFAULT_ORDER,
    filters = {}
  } = params

  const supabase = await createClient()

  let countQuery = supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      countQuery.eq(key, value)
    }
  })

  if (params.search) {
    const searchCondition = `name.ilike.%${params.search}%,surname.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`
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

  let query = supabase.from('customers').select(queryColumns)

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      query = query.eq(key, value)
    }
  })

  if (params.search) {
    const searchCondition = `name.ilike.%${params.search}%,surname.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`
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
    data: Customer[]
    error: PostgrestError
  }

  return {
    data,
    error,
    count: totalRows
  }
}
