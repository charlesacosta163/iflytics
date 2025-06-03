import React from 'react'

const LoadingPage = () => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="h-10 w-80 bg-gray-300 rounded-lg animate-pulse"></div>
        <div className="h-6 w-60 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Top Stats Grid - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Flights - Peach */}
        <div className="bg-[#FFE8CD] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-400 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-orange-300 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-orange-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 w-16 bg-orange-400 rounded animate-pulse"></div>
        </div>

        {/* Landings - Green */}
        <div className="bg-[#FFE8CD] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-400 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-green-300 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-green-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 w-16 bg-green-400 rounded animate-pulse"></div>
        </div>

        {/* Flight Time - Purple */}
        <div className="bg-[#FFE8CD] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-400 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-purple-300 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-purple-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 w-16 bg-purple-400 rounded animate-pulse"></div>
        </div>

        {/* XP Earned - Orange */}
        <div className="bg-[#FFE8CD] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-400 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-orange-300 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-orange-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 w-16 bg-orange-400 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Middle Section - 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Averages - Blue */}
        <div className="bg-[#D6E7FF] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-400 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-32 bg-blue-300 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-blue-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-blue-300 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-blue-400 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Origin - Pink/Red */}
        <div className="bg-[#FFDCDC] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-400 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-28 bg-red-300 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-red-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center justify-center h-20">
            <div className="h-12 w-20 bg-red-400 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Top Destination - Orange */}
        <div className="bg-[#FFE8CD] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-400 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-28 bg-orange-300 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-orange-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center justify-center h-20">
            <div className="h-12 w-20 bg-orange-400 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Flight Time Chart - Dark */}
      <div className="bg-dark rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gray-500 rounded-lg animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 w-36 bg-gray-400 rounded animate-pulse"></div>
            <div className="h-3 w-28 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-48 bg-gray-600 rounded-lg flex items-center justify-center">
          <div className="flex gap-2 items-end">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-6 bg-gray-400 rounded-t animate-pulse"
                style={{ 
                  height: `${Math.random() * 120 + 30}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section - Aircraft Usage & Top 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aircraft Usage - Dark with Pie Chart */}
        <div className="bg-dark rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-500 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-28 bg-gray-400 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center justify-center h-48">
            <div className="w-32 h-32 border-8 border-gray-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Top 3 Aircraft - Dark */}
        <div className="bg-dark rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-500 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-400 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-12 bg-gray-500 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-gray-400 rounded animate-pulse"></div>
                  <div className="h-3 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-8 bg-gray-400 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage