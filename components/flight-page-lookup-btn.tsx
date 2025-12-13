'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LuFileSearch2 } from 'react-icons/lu'
import { Badge } from '@/components/ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'

const FlightPageLookupButton = ({flightsTotal}: {flightsTotal: number}) => {
    const maxPages = Math.ceil(flightsTotal / 10)
    
    const [page, setPage] = useState(1)
    const [error, setError] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate page number
        if (!page || isNaN(page)) {
            setError('Please enter a valid page number')
            return
        }

        if (page < 1) {
            setError('Page number must be at least 1')
            return
        }

        if (page > maxPages) {
            setError(`Page number cannot exceed ${maxPages}`)
            return
        }

        // Navigate to the page
        router.push(`${pathname}?page=${page}`)
        setOpen(false)
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge className="absolute -top-6 right-0 cursor-pointer"><LuFileSearch2 /> Lookup</Badge>
      </DialogTrigger>
      <DialogContent className='w-[300px]'>
        <DialogHeader>
          <DialogTitle className='font-bold'>Enter Page Number</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="page" className='mb-2'>Page Number (max {maxPages})</Label>
                <Input 
                    id="page"
                    type="number" 
                    name="page" 
                    placeholder="Page Number" 
                    min="1" 
                    max={maxPages} 
                    value={page}
                    onChange={(e) => setPage(Number(e.target.value))} 
                    className={error ? 'border-red-500' : ''}
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <p className="text-sm text-muted-foreground">
                {page >= 1 && page <= maxPages 
                    ? `Showing flights ${page * 10 - 9} - ${Math.min(page * 10, flightsTotal)}`
                    : 'Invalid page number'
                }
            </p>
            <Button type="submit" className="w-full">Go to Page {page}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FlightPageLookupButton