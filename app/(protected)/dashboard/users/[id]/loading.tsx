import React from 'react'

const Loading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full gap-4">
        <div className="col-span-1 h-full w-full bg-gray-400 rounded-lg animate-pulse"></div>
        <div className="col-span-1 h-full w-full bg-gray-400 rounded-lg animate-pulse"></div>
    </div>
  )
}

export default Loading