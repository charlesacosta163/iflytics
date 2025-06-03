import React from 'react'

const LoadingPage = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-full w-full">
      <div className="w-full max-w-2xl space-y-6">
        {/* Title skeleton */}
        <div className="h-12 bg-gray-300 rounded-lg animate-pulse mx-auto w-64"></div>
        
        {/* Card skeleton */}
        <div className='flex sm:flex-row flex-col gap-6 w-full px-6 py-8 bg-white rounded-xl shadow-lg border border-gray-100'>
          {/* Avatar skeleton */}
          <div className='self-center sm:self-start shrink-0'>
            <div className="w-[120px] h-[120px] bg-gray-300 rounded-full animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className='flex-1 flex flex-col gap-5'>
            {/* Header skeleton */}
            <div className="text-center sm:text-left space-y-2">
              <div className='h-8 bg-gray-300 rounded animate-pulse w-48'></div>
              <div className='h-4 bg-gray-200 rounded animate-pulse w-32'></div>
            </div>

            {/* Bio skeleton */}
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
              <div className='space-y-2'>
                <div className='h-4 bg-gray-300 rounded animate-pulse w-full'></div>
                <div className='h-4 bg-gray-300 rounded animate-pulse w-3/4'></div>
              </div>
            </div>

            {/* Footer skeleton */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 items-center">
              <div className='h-12 bg-gray-300 rounded-lg animate-pulse w-32'></div>
              <div className="text-center sm:text-right space-y-1">
                <div className='h-3 bg-gray-200 rounded animate-pulse w-20'></div>
                <div className='h-4 bg-gray-300 rounded animate-pulse w-28'></div>
              </div>
            </div>
          </div>
        </div>
    </div>
    </main>
  )
}

export default LoadingPage