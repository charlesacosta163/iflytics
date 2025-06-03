'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaSearch, FaSignInAlt } from 'react-icons/fa'
import infinilyticsLogo from '@/public/infinilyticslogo.svg'
import Image from 'next/image'
import Pathname from './dashboard-ui/shared/pathname'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setIsLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleAuthClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <header className="p-4 w-full flex justify-center">
      <nav className="flex justify-between items-center w-full max-w-6xl rounded-full bg-white/10 backdrop-blur-sm ">
        {/* Logo Section */}
        <Pathname />

        {/* Navigation Buttons */}
        <div className="flex gap-3 items-center">
          {/* Search Button */}
          <Link 
            href="/" 
            className="hidden md:flex group gap-2 items-center px-3 py-2 text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <FaSearch className="group-hover:rotate-12 transition-transform duration-200"/> 
            <span>Search</span>
          </Link>

          {/* Dynamic Auth Button */}
          {!isLoading ? (
            <button
              onClick={handleAuthClick}
              className='group flex gap-2 items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-700 hover:border-gray-900 rounded-full font-bold transition-all duration-200 hover:scale-105 hover:bg-gray-50'
            >
              <FaSignInAlt className="group-hover:translate-x-1 transition-transform duration-200"/>
              <span>{isLoggedIn ? 'Dashboard' : 'Login'}</span>
            </button>
          ) : (
            <div className='flex gap-2 items-center px-3 py-2 text-sm text-gray-700 border-2 border-gray-700 rounded-full font-bold'>
              <FaSignInAlt />
              <span>...</span>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar