import { AppSidebar } from '@/components/app-sidebar'
import { DynamicBreadcrumbs } from '@/components/breadcrumbs'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { auth } from '@/lib/auth'
import type { User } from '@/types/auth'

export default async function BackOfficeLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <>
      <SidebarProvider>
        <AppSidebar user={session?.user as User} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height]  ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumbs />
            </div>
          </header>
          <section className="flex w-full min-w-0 max-w-full flex-1 flex-col items-start justify-start overflow-hidden p-4 pt-0 md:max-w-[calc(100vw-var(--sidebar-width))] group-has-[[data-collapsible=icon]]/sidebar-wrapper:md:max-w-[calc(100vw-var(--sidebar-collapsed-width))]">
            {children}
          </section>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-right" />
    </>
  )
}
