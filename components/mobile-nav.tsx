'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FaBook, FaSearch, FaSignInAlt } from 'react-icons/fa'
import { LiaGlobeAmericasSolid } from 'react-icons/lia'
import { LuMessageCircleQuestion } from 'react-icons/lu'
import { GrMoney } from 'react-icons/gr'
import { PiNewspaperLight } from 'react-icons/pi'
import { Menu, X } from 'lucide-react'
import { InlineThemeSwitcher } from './inline-theme-switcher'

interface MobileNavProps {
  isLoggedIn: boolean
  isLoading: boolean
  onAuthClick: () => void
}

const LINKS = [
  { href: '/',          label: 'Search User', icon: <FaSearch className="w-4 h-4 text-gray-500" /> },
  { href: '/map/earth',  label: 'Live Map',    icon: <LiaGlobeAmericasSolid className="w-4 h-4 text-blue-500" />, badge: true },
  { href: '/directory', label: 'Directory',   icon: <FaBook className="w-4 h-4 text-gray-500" /> },
  { href: '/blog',      label: 'Blog',        icon: <PiNewspaperLight className="w-4 h-4 text-gray-500" /> },
  { href: '/#pricing',  label: 'Pricing',     icon: <GrMoney className="w-4 h-4 text-gray-500" /> },
  { href: '/#faq',      label: 'FAQs',        icon: <LuMessageCircleQuestion className="w-4 h-4 text-gray-500" /> },
]

const MobileNav = ({ isLoggedIn, isLoading, onAuthClick }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Hamburger */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 z-[10000]"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <Menu className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-180 scale-50' : 'opacity-100'}`} />
          <X    className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 -rotate-180 scale-50'}`} />
        </div>
      </button>

      {/* Dropdown */}
      <div
        className={`md:hidden absolute top-12 right-0 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[9999] transition-all duration-200 origin-top-right ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Navigate</p>
        </div>

        <nav className="p-2 space-y-0.5">
          {LINKS.map(({ href, label, icon, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
            >
              {icon}
              {label}
              {badge && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Theme</span>
          <InlineThemeSwitcher />
        </div>

        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
          {!isLoading ? (
            <button
              onClick={() => { onAuthClick(); setIsOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 transition-colors duration-150"
            >
              <FaSignInAlt className="w-4 h-4" />
              {isLoggedIn ? 'Dashboard' : 'Login'}
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400">
              <FaSignInAlt className="w-4 h-4" />
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}

export default MobileNav
