import React from 'react'

const Loading = () => {
  return (
    <div className='space-y-8'>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-3">
          <div className="h-10 w-80 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 w-16 bg-gray-800 rounded-full flex items-center justify-center">
            <div className="h-8 w-8 bg-gray-600 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-dark rounded-xl p-6 relative">
            {/* New Badge */}
            <div className="absolute top-4 right-4 h-6 w-12 bg-green-500 rounded-full animate-pulse"></div>
            
            {/* User Avatar and Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-400 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-500 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-gray-500 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-500 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-500 rounded animate-pulse"></div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-500 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-24 bg-gray-600 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loading 