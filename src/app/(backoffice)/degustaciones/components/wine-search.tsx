'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ImageOff } from 'lucide-react'

import Image from 'next/image'

import { searchWines } from '@/app/(backoffice)/degustaciones/actions'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

export interface Wine {
  id: number
  name: string
  winery: string
  variety: string
  year: number
  image?: string | null | undefined
  cost_usd_blue?: number | null
  stock?: number | null
  reserved_stock?: number | null
}

interface WineSearchProps {
  selectedWines: Wine[]
  onWineSelect: (wine: Wine) => void
}

export function WineSearch({ selectedWines, onWineSelect }: WineSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Wine[]>([])
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = inputRef.current
    if (input) {
      const savedSelectionStart = input.selectionStart
      const savedSelectionEnd = input.selectionEnd
      input.focus()
      input.setSelectionRange(savedSelectionStart, savedSelectionEnd)
    }
  }, [searchResults])

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const data = await searchWines(debouncedQuery)
        setSearchResults(data)
      } catch (error) {
        console.error('Error searching wines:', error)
      } finally {
        setIsSearching(false)
      }
    }

    search()
  }, [debouncedQuery])

  const handleSelect = (wine: Wine) => {
    if (!selectedWines.some((w) => w.id === wine.id)) {
      onWineSelect(wine)
      setQuery('')
      setSearchResults([])
    }
  }

  return (
    <Command className="rounded-lg border">
      <CommandInput
        ref={inputRef}
        placeholder="Buscar vinos..."
        value={query}
        onValueChange={setQuery}
        disabled={isSearching}
        className="focus:ring-0"
        autoComplete="off"
      />
      <CommandList>
        {query && !searchResults.length && !isSearching && (
          <CommandEmpty className="p-4 text-center text-sm">
            No se encontraron resultados
          </CommandEmpty>
        )}
        {searchResults.length > 0 && (
          <CommandGroup heading="Resultados de búsqueda:" className="">
            <ScrollArea className="max-h-52">
              {searchResults.map((wine) => {
                const isSelected = selectedWines.some((w) => w.id === wine.id)
                return (
                  <CommandItem
                    key={wine.id}
                    value={wine.name}
                    onSelect={() => handleSelect(wine)}
                    className={cn('gap-2', isSelected && 'bg-muted/50')}
                  >
                    {wine.image ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={wine.image}
                          alt={wine.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
                        <ImageOff className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {wine.name}
                        </span>
                        {wine.cost_usd_blue && (
                          <span className="shrink-0 text-xs font-semibold">
                            USD{' '}
                            {wine.cost_usd_blue.toLocaleString('es-AR', {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="truncate">{wine.winery}</span>
                        <span>·</span>
                        <span className="truncate">{wine.variety}</span>
                        <span>·</span>
                        <span className="shrink-0">{wine.year}</span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isSelected ? 'text-primary opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </ScrollArea>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}
