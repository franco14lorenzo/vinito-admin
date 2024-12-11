import { PostgrestError } from '@supabase/supabase-js'

import { columns } from '@/app/(backoffice)/faqs/components/columns'
import { CreateFAQButton } from '@/app/(backoffice)/faqs/components/create-faq-button'
import { CreateFAQProvider } from '@/app/(backoffice)/faqs/components/create-faq-context'
import { CreateFAQSheet } from '@/app/(backoffice)/faqs/components/create-faq-sheet'
import { DataTable } from '@/app/(backoffice)/faqs/components/data-table'
import {
  DEFAULT_COLUMNS,
  DEFAULT_ORDER
} from '@/app/(backoffice)/faqs/constants'
import { FAQ, FAQParams, FAQStatus } from '@/app/(backoffice)/faqs/types'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function FAQsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: FAQParams = {
    create: awaitedSearchParams.create as string,
    edit: awaitedSearchParams.edit as string,
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
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const editId = params.edit ? parseInt(params.edit, 10) : undefined

  const { data, error, count } = await getFAQs(
    params,
    params.visibleColumns || []
  )

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <CreateFAQProvider
      isCreateOpenParams={params.create === 'true'}
      isEditOpenParams={editId ? String(editId) : ''}
    >
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">FAQs</h2>
            <CreateFAQButton />
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
        <CreateFAQSheet
          adminId={session?.user?.id}
          editId={editId ? String(editId) : undefined}
        />
      </div>
    </CreateFAQProvider>
  )
}

async function getFAQs(params: FAQParams = {}, visibleColumns: string[]) {
  const {
    page = 1,
    perPage = 10,
    orderBy = DEFAULT_ORDER,
    filters = {}
  } = params

  const supabase = await createClient()

  let countQuery = supabase
    .from('faqs')
    .select('id', { count: 'exact', head: true })

  const { order: orderFilter, ...otherFilters } = filters
  if (orderFilter !== undefined) {
    countQuery.eq('order', orderFilter)
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

  const filteredColumns = visibleColumns.filter((col) =>
    DEFAULT_COLUMNS.includes(col)
  )

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
