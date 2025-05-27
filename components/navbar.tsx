import React from 'react'
import Link from 'next/link'
import { FaSearch } from 'react-icons/fa'
import infinilyticsLogo from '@/public/infinilyticslogo.svg'
import Image from 'next/image'
const Navbar = () => {
  return (
    <header className="p-4 w-full flex justify-center">
        <nav className="flex justify-between items-center w-full rounded-full">
          <div className='relative'>
            <Link href="/" className="text-2xl font-bold tracking-tighter flex gap-2 items-center">
               <Image src={infinilyticsLogo} alt="Infinilytics Logo" width={32} height={32} />
               IFlytics
            </Link>

            <span className='text-[10px] font-semibold text-white bg-orange-400 rounded-full absolute -bottom-4 left-8 px-2 py-0.10'>Guest</span>
          </div>

            <div className="flex gap-4 items-center text-sm font-semibold">
                <Link href="/" className=" flex gap-2 items-center px-4 py-1 bg-gray-700 text-light hover:bg-dark rounded-full"> <FaSearch/> Search</Link>
                <Link href='/auth/login' className='text-gray-700 border-b-2 border-gray font-bold'>Login</Link>
            </div>
        </nav>
    </header>
  )
}

export default Navbar