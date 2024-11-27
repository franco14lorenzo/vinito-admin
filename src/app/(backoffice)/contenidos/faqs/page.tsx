import { PostgrestError } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

import { columns } from './columns'
import { CreateFAQButton } from './create-faq-button'
import { CreateFAQSheet } from './create-faq-sheet'
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
  search?: string
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
      column: (awaitedSearchParams.sortBy as string) || 'order',
      ascending: awaitedSearchParams.sortOrder !== 'desc'
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
      : ['order', 'question', 'answer', 'status'],
    search: (awaitedSearchParams.search as string) || ''
  }

  const { data, error, count } = await getFAQs(
    params,
    params.visibleColumns || []
  )

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  return (
    <div className="container mx-auto py-1">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">FAQs</h2>
        <CreateFAQButton />
      </div>
      <DataTable columns={columns} data={data || []} pageCount={pageCount} />
      <CreateFAQSheet />
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

  let countQuery = supabase
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

  if (params.search) {
    const searchInt = parseInt(params.search, 10)
    const searchCondition = `question.ilike.%${params.search}%,answer.ilike.%${params.search}%`
    if (!isNaN(searchInt)) {
      countQuery = countQuery.or(`${searchCondition},order.eq.${searchInt}`)
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

  // Ensure 'id' is always included in the query
  const queryColumns = [...new Set(['id', ...filteredColumns])].join(',')

  let query = supabase.from('faqs').select(queryColumns)

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

  if (params.search) {
    const searchInt = parseInt(params.search, 10)
    const searchCondition = `question.ilike.%${params.search}%,answer.ilike.%${params.search}%`
    if (!isNaN(searchInt)) {
      query = query.or(`${searchCondition},order.eq.${searchInt}`)
    } else {
      query = query.or(searchCondition)
    }
  }

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

  return {
    data,
    error,
    count: totalRows
  }
}
