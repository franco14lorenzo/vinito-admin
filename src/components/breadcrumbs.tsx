'use client'

import { Fragment } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  const isRoot = pathname === '/'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isRoot ? (
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          ) : (
            <BreadcrumbLink title="Inicio" asChild>
              <Link href="/">Inicio</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isRoot && (
          <>
            <BreadcrumbSeparator />
            {paths.map((path, index) => {
              const isLast = index === paths.length - 1
              const href = `/${paths.slice(0, index + 1).join('/')}`
              const formattedPath =
                path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')

              return (
                <Fragment key={`${path}-${index}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{formattedPath}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{formattedPath}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </Fragment>
              )
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
