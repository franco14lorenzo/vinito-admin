import { PostgrestError } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

import { columns } from './columns'
import { DataTable } from './data-table'

type FAQStatus = 'draft' | 'active' | 'inactive' | 'deleted'

interface FAQFilters {
  page?: number
  perPage?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }
  filters?: {
    question?: string
    answer?: string
    order?: number
    status?: FAQStatus | FAQStatus[]
  }
  visibleColumns?: string[]
}

export type FAQ = {
  id: number
  question: string
  answer: string
  order: number
  status: FAQStatus
  created_at: string
}

export default async function FAQsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const awaitedSearchParams = await searchParams
  const params: FAQFilters = {
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    orderBy: {
      column: (awaitedSearchParams.orderBy as string) || 'order',
      ascending: awaitedSearchParams.sortDirection !== 'desc'
    },
    filters: {
      question: awaitedSearchParams.question as string,
      answer: awaitedSearchParams.answer as string,
      order: awaitedSearchParams.order
        ? Number(awaitedSearchParams.order)
        : undefined,
      status: awaitedSearchParams.status
        ? ((awaitedSearchParams.status as string).split(',') as FAQStatus[])
        : undefined
    },
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : ['order', 'question', 'answer', 'status']
  }

  const { data, error, count } = await getFAQs(
    params,
    params.visibleColumns || []
  )

  console.log('Fetched data:', data)
  console.log('Query error:', error)

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  return (
    <div className="container mx-auto py-1">
      <h2 className="mb-5 text-2xl font-bold tracking-tight">FAQs</h2>
      <DataTable
        columns={columns}
        data={data || []}
        pageCount={pageCount}
        currentPage={params.page}
      />
    </div>
  )
}

async function getFAQs(params: FAQFilters = {}, visibleColumns: string[]) {
  const {
    page = 1,
    perPage = 10,
    orderBy = { column: 'order', ascending: true },
    filters = {}
  } = params

  const supabase = await createClient()

  const countQuery = supabase
    .from('faqs')
    .select('id', { count: 'exact', head: true })

  const { order: orderFilter, ...otherFilters } = filters
  if (orderFilter !== undefined) {
    countQuery.eq('"order"', orderFilter)
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

  const { count: totalRows } = await countQuery

  if (!totalRows) {
    return { data: [], error: null, count: 0 }
  }

  const databaseColumns = [
    'id',
    'question',
    'answer',
    'order',
    'status',
    'created_at'
  ]

  const filteredColumns = visibleColumns.filter((col) =>
    databaseColumns.includes(col)
  )

  let query = supabase.from('faqs').select(filteredColumns.join(','))

  if (filters.order !== undefined) {
    query = query.eq('order', filters.order)
  }
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && key !== 'order') {
      if (key === 'status' && Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    }
  })

  const from = (page - 1) * perPage
  const to = from + (perPage - 1)

  query = query
    .order(orderBy.column === 'order' ? 'order' : orderBy.column, {
      ascending: orderBy.ascending
    })
    .range(from, to)

  const { data, error } = (await query) as unknown as {
    data: FAQ[]
    error: PostgrestError
  }

  console.log('Fetched data:', data)
  console.log('Query error:', error)

  return {
    data,
    error,
    count: totalRows
  }
}
