import { PostgrestError } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { DEFAULT_COLUMNS, DEFAULT_ORDER } from './constants'
import { Contact, ContactParams } from './types'

export default async function ContactsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: ContactParams = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || '',
    contactId: Number(awaitedSearchParams.contact_id as string) || undefined
  }

  const { data, error, count } = await getContacts(
    params,
    params.visibleColumns || []
  )

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  return (
    <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
      <div className="flex-none">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Mensajes de Contacto
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

async function getContacts(
  params: ContactParams = {},
  visibleColumns: string[]
) {
  const { page = 1, perPage = 10, orderBy = DEFAULT_ORDER, contactId } = params

  const supabase = await createClient()

  let countQuery = supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .neq('status', 'deleted')

  // If contact_id is provided, filter by it
  if (contactId) {
    countQuery = countQuery.eq('id', contactId)
  } else if (params.search) {
    countQuery = countQuery.or(
      `name.ilike.%${params.search}%,email.ilike.%${params.search}%,message.ilike.%${params.search}%`
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

  let query = supabase
    .from('contacts')
    .select(queryColumns)
    .neq('status', 'deleted')

  // If contact_id is provided, filter by it
  if (contactId) {
    query = query.eq('id', contactId)
  } else if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,email.ilike.%${params.search}%,message.ilike.%${params.search}%`
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
    data: Contact[]
    error: PostgrestError
  }

  return {
    data,
    error,
    count: totalRows
  }
}
