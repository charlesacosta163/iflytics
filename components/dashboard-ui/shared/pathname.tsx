'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import iflyticsLogo from '@/public/infinilyticslogo.svg'
const Pathname = () => {

  return (
    <div className='relative'>
            <Link href="/" className="text-2xl font-bold tracking-tighter flex gap-2 items-center">
               <Image src={iflyticsLogo} alt="Infinilytics Logo" width={32} height={32} />
               IFlytics
            </Link>

            <span className='text-[10px] font-semibold text-white bg-red-400 rounded-full absolute -bottom-4 left-5 px-2 py-0.10 shadow-lg z-100'>Early Alpha</span>
          </div>
  )
}

export default Pathname