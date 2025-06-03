import React from 'react'
import Link from 'next/link'
import { FaSearch, FaSignInAlt } from 'react-icons/fa'
import infinilyticsLogo from '@/public/infinilyticslogo.svg'
import Image from 'next/image'
import Pathname from './dashboard-ui/shared/pathname'

const Navbar = () => {
  return (
    <header className="p-4 w-full flex justify-center">
      <nav className="flex justify-between items-center w-full max-w-6xl rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
        {/* Logo Section */}
        <Pathname />

        {/* Navigation Buttons */}
        <div className="flex gap-3 items-center">
          {/* Search Button */}
          <Link 
            href="/" 
            className="group flex gap-2 items-center px-3 py-2 text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <FaSearch className="group-hover:rotate-12 transition-transform duration-200"/> 
            <span>Search</span>
          </Link>

          {/* Login Button */}
          <Link 
            href='/auth/login' 
            className='group flex gap-2 items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-700 hover:border-gray-900 rounded-full font-bold transition-all duration-200 hover:scale-105 hover:bg-gray-50'
          >
            <FaSignInAlt className="group-hover:translate-x-1 transition-transform duration-200"/>
            <span>Login</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar