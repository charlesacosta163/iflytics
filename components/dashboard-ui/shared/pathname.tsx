'use client'

import React from 'react'
import Image from 'next/image'
const Pathname = () => {

  return (
    <div className="flex gap-1 items-center">
      <Image 
        src="/infinilyticslogo.svg"
        width={30}
        height={30}
        alt="Logo"
      />
      <span className='font-bold tracking-tight text-dark text-xl'>IFlytics</span>
    </div>
  )
}

export default Pathname