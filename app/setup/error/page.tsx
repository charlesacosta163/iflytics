import Link from 'next/link'
import React from 'react'
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const ErrorPage = () => {
    return (
        <Card className="max-w-[600px] w-full flex flex-col items-center bg-gradient-to-br from-gray to-dark text-light p-8 rounded-[25px]">
          <div>
            <CardTitle className='text-2xl font-bold text-center'>Error!</CardTitle>
            <CardDescription className='text-sm font-semibold'>Something went wrong or the user was not found. Please try again.</CardDescription>
          </div>

          <CardContent>
            <Link href="/setup/setifcusername" className='text-sm font-semibold text-gray-200 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300'>Try again</Link>
          </CardContent>
        </Card>
      )
}

export default ErrorPage