import { PostgrestError } from '@supabase/supabase-js'

import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { EditSettingProvider } from './components/edit-setting-context'
import { EditSettingSheet } from './components/edit-setting-sheet'
import { DEFAULT_COLUMNS, DEFAULT_ORDER } from './constants'
import { Setting, SettingParams } from './types'

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const awaitedSearchParams = await searchParams
  const params: SettingParams = {
    edit: awaitedSearchParams.edit as string,
    page: Number(awaitedSearchParams.page) || 1,
    perPage: Number(awaitedSearchParams.perPage) || 10,
    visibleColumns: awaitedSearchParams.columns
      ? (awaitedSearchParams.columns as string).split(',').filter(Boolean)
      : DEFAULT_COLUMNS,
    search: (awaitedSearchParams.search as string) || ''
  }

  const editId = params.edit ? parseInt(params.edit, 10) : undefined

  const { data, error, count } = await getSettings(
    params,
    params.visibleColumns || []
  )

  if (error) {
    throw error
  }

  const pageCount = count ? Math.ceil(count / (params.perPage || 10)) : 0

  const session = await auth()

  return (
    <EditSettingProvider isEditOpenParams={editId ? String(editId) : ''}>
      <div className="flex h-[calc(100dvh-80px)] w-full flex-col gap-4 p-4">
        <div className="flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Configuraciones
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
        <EditSettingSheet
          adminId={session?.user?.id}
          editId={editId ? String(editId) : undefined}
        />
      </div>
    </EditSettingProvider>
  )
}

async function getSettings(
  params: SettingParams = {},
  visibleColumns: string[]
) {
  const { page = 1, perPage = 10, orderBy = DEFAULT_ORDER } = params

  const supabase = await createClient()

  let countQuery = supabase
    .from('settings')
    .select('id', { count: 'exact', head: true })

  if (params.search) {
    countQuery = countQuery.or(
      `key.ilike.%${params.search}%,value.ilike.%${params.search}%,description.ilike.%${params.search}%`
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

  let query = supabase.from('settings').select(queryColumns)

  if (params.search) {
    query = query.or(
      `key.ilike.%${params.search}%,value.ilike.%${params.search}%,description.ilike.%${params.search}%`
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
    data: Setting[]
    error: PostgrestError
  }

  return {
    data,
    error,
    count: totalRows
  }
}
