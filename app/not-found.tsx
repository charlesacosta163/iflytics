import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FaSearch } from 'react-icons/fa'
export default function NotFound() {
  return (
    <div className='h-screen flex flex-1 items-center justify-center'>
    <div className='p-4 flex flex-col items-center gap-4'>
        <h1 className='text-2xl font-bold text-red-500'>404 - Page Not Found</h1>
        <p className='text-gray-500'>Sorry, we couldn't find the page you were looking for.</p>
        <Link href="/" className="text-blue-500">
           <Button variant="outline" className='flex items-center gap-2 font-bold bg-gray hover:bg-dark hover:text-white text-white'>
                <FaSearch />
                Back to Search
           </Button>
        </Link>
    </div>
    </div>
  )
}