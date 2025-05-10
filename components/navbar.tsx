import React from 'react'
import Link from 'next/link'
import { FaSearch } from 'react-icons/fa'
import infinilyticsLogo from '@/public/infinilyticslogo.svg'
import Image from 'next/image'
const Navbar = () => {
  return (
    <header className="p-4 w-full flex justify-center">
        <nav className="flex justify-between items-center w-full rounded-full">
            <Link href="/" className="text-2xl font-bold tracking-tighter flex gap-2 items-center">
               <Image src={infinilyticsLogo} alt="Infinilytics Logo" width={32} height={32} />
               Infinilytics
            </Link>

            <div className="flex gap-2">
                <Link href="/" className="text-sm font-semibold flex gap-2 items-center px-4 py-1 bg-gray-700 text-light hover:bg-dark rounded-full"> <FaSearch/> Search</Link>
            </div>
        </nav>
    </header>
  )
}

export default Navbar