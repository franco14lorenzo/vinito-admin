import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export default function LoadingCustomers() {
  return (
    <div className="container mx-auto py-10">
      <h2 className="mb-5 text-2xl font-bold tracking-tight">
        <Skeleton className="h-8 w-[200px]" />
      </h2>

      <div className="w-full">
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="ml-auto h-10 w-[100px]" />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-10 w-[100px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-8 w-[70px]" />
          </div>
          <div className="space-x-2">
            <Skeleton className="inline-block h-8 w-[80px]" />
            <Skeleton className="inline-block h-8 w-[80px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
